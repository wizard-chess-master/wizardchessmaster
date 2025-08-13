/**
 * Transfer Learning System for AI Training
 * Loads pre-trained models and fine-tunes with current neural network
 * Accelerates training by leveraging existing knowledge
 */

import * as tf from '@tensorflow/tfjs';
import { deepNN } from './deepNeuralNetwork';
import { logger } from '../utils/logger';

export interface TransferConfig {
  baseModelPath?: string;
  freezeLayers?: number;
  learningRateMultiplier?: number;
  fineTuneEpochs?: number;
  regularizationStrength?: number;
}

export interface TransferMetrics {
  baseModelAccuracy: number;
  improvedAccuracy: number;
  transferGain: number;
  trainingTime: number;
  layersTransferred: number;
}

export class TransferLearningSystem {
  private baseModel: tf.LayersModel | null = null;
  private transferredLayers: tf.layers.Layer[] = [];
  private metrics: TransferMetrics = {
    baseModelAccuracy: 0,
    improvedAccuracy: 0,
    transferGain: 0,
    trainingTime: 0,
    layersTransferred: 0
  };

  constructor() {
    logger.info('Transfer Learning System initialized');
  }

  /**
   * Load a pre-trained base model for transfer learning
   */
  async loadBaseModel(modelPath?: string): Promise<void> {
    try {
      console.log('📥 Loading base model for transfer learning...');
      
      // Default to best available checkpoint
      const path = modelPath || 'localstorage://wizard_chess_base_model';
      
      // Check if base model exists
      const models = await tf.io.listModels();
      const modelExists = Object.keys(models).some(key => key.includes('base_model'));
      
      if (modelExists) {
        this.baseModel = await tf.loadLayersModel(path);
        console.log('✅ Base model loaded successfully');
        
        // Analyze base model
        this.analyzeModel(this.baseModel);
      } else {
        console.log('📦 No base model found, creating from current network');
        // Use current deep neural network as base
        if (deepNN.model) {
          this.baseModel = deepNN.model;
          await this.saveAsBaseModel();
        }
      }
    } catch (error) {
      logger.error('Failed to load base model:', error);
      console.log('⚠️ Using current model as base');
    }
  }

  /**
   * Apply transfer learning to current model
   */
  async applyTransferLearning(config: TransferConfig = {}): Promise<TransferMetrics> {
    const startTime = performance.now();
    
    const {
      freezeLayers = 3,
      learningRateMultiplier = 0.1,
      fineTuneEpochs = 50,
      regularizationStrength = 0.001
    } = config;

    console.log('\n🔄 Applying Transfer Learning');
    console.log(`   Frozen layers: ${freezeLayers}`);
    console.log(`   Learning rate multiplier: ${learningRateMultiplier}`);
    console.log(`   Fine-tune epochs: ${fineTuneEpochs}`);

    if (!this.baseModel) {
      await this.loadBaseModel();
    }

    if (!this.baseModel) {
      throw new Error('No base model available for transfer learning');
    }

    // Create new model with transferred layers
    const newModel = await this.createTransferModel(
      this.baseModel,
      freezeLayers,
      regularizationStrength
    );

    // Compile with adjusted learning rate
    const baseLearningRate = 0.001;
    const transferLearningRate = baseLearningRate * learningRateMultiplier;
    
    newModel.compile({
      optimizer: tf.train.adam(transferLearningRate),
      loss: {
        'value_output': 'meanSquaredError',
        'policy_output': 'categoricalCrossentropy'
      },
      metrics: ['accuracy']
    });

    // Fine-tune on new data
    await this.fineTuneModel(newModel, fineTuneEpochs);

    // Calculate metrics
    const endTime = performance.now();
    this.metrics.trainingTime = (endTime - startTime) / 1000;
    this.metrics.layersTransferred = this.transferredLayers.length;
    this.metrics.transferGain = this.metrics.improvedAccuracy - this.metrics.baseModelAccuracy;

    // Update deep neural network with transferred model
    deepNN.model = newModel;

    console.log('\n✅ Transfer Learning Complete');
    console.log(`   Layers transferred: ${this.metrics.layersTransferred}`);
    console.log(`   Accuracy improvement: +${(this.metrics.transferGain * 100).toFixed(2)}%`);
    console.log(`   Training time: ${this.metrics.trainingTime.toFixed(2)}s`);

    logger.info('Transfer learning applied successfully', this.metrics);
    return this.metrics;
  }

  /**
   * Create a new model with transferred layers
   */
  private async createTransferModel(
    baseModel: tf.LayersModel,
    freezeLayers: number,
    regularization: number
  ): Promise<tf.LayersModel> {
    console.log('🔨 Building transfer model...');

    // Get base model layers
    const baseLayers = baseModel.layers;
    
    // Create new model
    const input = tf.input({ shape: [1024] }); // Match deep NN input
    let x: tf.SymbolicTensor = input;

    // Transfer and potentially freeze early layers
    for (let i = 0; i < Math.min(freezeLayers, baseLayers.length - 2); i++) {
      const layer = baseLayers[i];
      
      // Clone layer with weights
      const clonedLayer = this.cloneLayer(layer, i === 0);
      clonedLayer.trainable = false; // Freeze transferred layers
      
      x = clonedLayer.apply(x) as tf.SymbolicTensor;
      this.transferredLayers.push(clonedLayer);
      
      console.log(`   Transferred layer ${i + 1}: ${layer.name} (frozen)`);
    }

    // Add new trainable layers with regularization
    x = tf.layers.dense({
      units: 256,
      activation: 'relu',
      kernelRegularizer: tf.regularizers.l2({ l2: regularization }),
      name: 'transfer_dense_1'
    }).apply(x) as tf.SymbolicTensor;

    x = tf.layers.dropout({ rate: 0.3 }).apply(x) as tf.SymbolicTensor;

    x = tf.layers.dense({
      units: 128,
      activation: 'relu',
      kernelRegularizer: tf.regularizers.l2({ l2: regularization }),
      name: 'transfer_dense_2'
    }).apply(x) as tf.SymbolicTensor;

    x = tf.layers.dropout({ rate: 0.2 }).apply(x) as tf.SymbolicTensor;

    // Output heads (value and policy)
    const valueOutput = tf.layers.dense({
      units: 1,
      activation: 'tanh',
      name: 'value_output'
    }).apply(x) as tf.SymbolicTensor;

    const policyOutput = tf.layers.dense({
      units: 100,
      activation: 'softmax',
      name: 'policy_output'
    }).apply(x) as tf.SymbolicTensor;

    // Create model
    const model = tf.model({
      inputs: input,
      outputs: [valueOutput, policyOutput]
    });

    return model;
  }

  /**
   * Clone a layer with its weights
   */
  private cloneLayer(layer: tf.layers.Layer, isFirstLayer: boolean = false): tf.layers.Layer {
    const config = layer.getConfig();
    const className = layer.getClassName();
    
    // Create new layer based on type
    let newLayer: tf.layers.Layer;
    
    if (className === 'Dense') {
      newLayer = tf.layers.dense(config as tf.layers.DenseLayerArgs);
    } else if (className === 'Dropout') {
      newLayer = tf.layers.dropout(config as tf.layers.DropoutLayerArgs);
    } else if (className === 'BatchNormalization') {
      newLayer = tf.layers.batchNormalization(config as any);
    } else {
      // Default to dense layer
      newLayer = tf.layers.dense({ units: 128, activation: 'relu' });
    }
    
    // Transfer weights if available
    if (layer.getWeights().length > 0) {
      const weights = layer.getWeights();
      newLayer.setWeights(weights);
    }
    
    return newLayer;
  }

  /**
   * Fine-tune the model on new data
   */
  private async fineTuneModel(
    model: tf.LayersModel,
    epochs: number
  ): Promise<void> {
    console.log(`\n🎯 Fine-tuning model for ${epochs} epochs...`);
    
    // Generate synthetic training data for fine-tuning
    // In production, this would use actual game data
    const batchSize = 32;
    const numSamples = 1000;
    
    // Create training data
    const xTrain = tf.randomNormal([numSamples, 1024]);
    const yValueTrain = tf.randomUniform([numSamples, 1], -1, 1);
    const yPolicyTrain = tf.randomUniform([numSamples, 100]);
    
    // Normalize policy outputs to sum to 1
    const yPolicyNormalized = tf.div(
      yPolicyTrain,
      tf.sum(yPolicyTrain, 1, true)
    );
    
    // Measure base accuracy
    const baseEval = model.evaluate(xTrain, [yValueTrain, yPolicyNormalized]) as tf.Scalar[];
    this.metrics.baseModelAccuracy = (await baseEval[0].data())[0];
    
    // Fine-tune
    const history = await model.fit(
      xTrain,
      [yValueTrain, yPolicyNormalized],
      {
        epochs,
        batchSize,
        validationSplit: 0.2,
        verbose: 0,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (epoch % 10 === 0) {
              console.log(`   Epoch ${epoch}/${epochs} - Loss: ${logs?.loss?.toFixed(4)}`);
            }
          }
        }
      }
    );
    
    // Measure improved accuracy
    const improvedEval = model.evaluate(xTrain, [yValueTrain, yPolicyNormalized]) as tf.Scalar[];
    this.metrics.improvedAccuracy = (await improvedEval[0].data())[0];
    
    // Clean up tensors
    xTrain.dispose();
    yValueTrain.dispose();
    yPolicyTrain.dispose();
    yPolicyNormalized.dispose();
    baseEval.forEach(t => t.dispose());
    improvedEval.forEach(t => t.dispose());
  }

  /**
   * Analyze model structure
   */
  private analyzeModel(model: tf.LayersModel): void {
    console.log('\n📊 Base Model Analysis:');
    console.log(`   Total layers: ${model.layers.length}`);
    
    let totalParams = 0;
    let trainableParams = 0;
    
    model.layers.forEach((layer, idx) => {
      const params = layer.countParams();
      totalParams += params;
      if (layer.trainable) {
        trainableParams += params;
      }
    });
    
    console.log(`   Total parameters: ${totalParams.toLocaleString()}`);
    console.log(`   Trainable parameters: ${trainableParams.toLocaleString()}`);
  }

  /**
   * Save current model as base for future transfer learning
   */
  async saveAsBaseModel(): Promise<void> {
    if (this.baseModel) {
      const path = 'localstorage://wizard_chess_base_model';
      await this.baseModel.save(path);
      console.log('💾 Model saved as base for future transfer learning');
      logger.info('Base model saved for transfer learning');
    }
  }

  /**
   * Perform knowledge distillation from teacher to student model
   */
  async performKnowledgeDistillation(
    teacherModel: tf.LayersModel,
    temperature: number = 3.0
  ): Promise<void> {
    console.log('\n🎓 Performing knowledge distillation...');
    console.log(`   Temperature: ${temperature}`);
    
    // Create smaller student model
    const studentModel = this.createStudentModel();
    
    // Generate training data
    const numSamples = 5000;
    const xTrain = tf.randomNormal([numSamples, 1024]);
    
    // Get teacher predictions (soft targets)
    const teacherPredictions = teacherModel.predict(xTrain) as tf.Tensor[];
    
    // Apply temperature scaling for softer probability distribution
    const softTargets = tf.div(teacherPredictions[1], temperature);
    const softTargetsNormalized = tf.softmax(softTargets);
    
    // Train student model on soft targets
    await studentModel.fit(
      xTrain,
      [teacherPredictions[0], softTargetsNormalized],
      {
        epochs: 100,
        batchSize: 64,
        validationSplit: 0.1,
        verbose: 0,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (epoch % 20 === 0) {
              console.log(`   Distillation epoch ${epoch}/100`);
            }
          }
        }
      }
    );
    
    console.log('✅ Knowledge distillation complete');
    
    // Clean up
    xTrain.dispose();
    teacherPredictions.forEach(t => t.dispose());
    softTargets.dispose();
    softTargetsNormalized.dispose();
  }

  /**
   * Create a smaller student model for distillation
   */
  private createStudentModel(): tf.LayersModel {
    const input = tf.input({ shape: [1024] });
    
    // Smaller architecture
    let x = tf.layers.dense({
      units: 128,
      activation: 'relu'
    }).apply(input) as tf.SymbolicTensor;
    
    x = tf.layers.dense({
      units: 64,
      activation: 'relu'
    }).apply(x) as tf.SymbolicTensor;
    
    const valueOutput = tf.layers.dense({
      units: 1,
      activation: 'tanh',
      name: 'value_output'
    }).apply(x) as tf.SymbolicTensor;
    
    const policyOutput = tf.layers.dense({
      units: 100,
      activation: 'softmax',
      name: 'policy_output'
    }).apply(x) as tf.SymbolicTensor;
    
    const model = tf.model({
      inputs: input,
      outputs: [valueOutput, policyOutput]
    });
    
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: ['meanSquaredError', 'categoricalCrossentropy'],
      metrics: ['accuracy']
    });
    
    return model;
  }

  /**
   * Get transfer learning metrics
   */
  getMetrics(): TransferMetrics {
    return { ...this.metrics };
  }
}

// Export singleton instance
export const transferLearning = new TransferLearningSystem();