import React from 'react';
import { useDeviceDetection } from '@/lib/hooks/useDeviceDetection';
import { useDeviceStore } from '@/lib/stores/useDeviceStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Smartphone, 
  Volume2, 
  Zap, 
  Eye, 
  RefreshCw,
  Settings2,
  Palette,
  Battery
} from 'lucide-react';

interface MobileSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSettingsDialog({ isOpen, onClose }: MobileSettingsDialogProps) {
  const deviceInfo = useDeviceDetection();
  const { settings, updateSetting, resetToDefaults } = useDeviceStore();

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Mobile Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          
          {/* Device Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                Device Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Device Type:</span>
                <span className="capitalize">{deviceInfo.deviceType}</span>
              </div>
              <div className="flex justify-between">
                <span>Orientation:</span>
                <span className="capitalize">{deviceInfo.orientation}</span>
              </div>
              <div className="flex justify-between">
                <span>Screen:</span>
                <span>{deviceInfo.screenWidth} × {deviceInfo.screenHeight}</span>
              </div>
              <div className="flex justify-between">
                <span>Touch Support:</span>
                <span>{deviceInfo.isTouch ? 'Yes' : 'No'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Chess Board Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Chess Board
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="space-y-2">
                <Label className="text-sm">Board Size</Label>
                <Select 
                  value={settings.mobileChessBoardSize} 
                  onValueChange={(value) => updateSetting('mobileChessBoardSize', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (300px)</SelectItem>
                    <SelectItem value="medium">Medium (375px)</SelectItem>
                    <SelectItem value="large">Large (450px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="coordinates" className="text-sm">Show Coordinates</Label>
                <Switch
                  id="coordinates"
                  checked={settings.mobileShowCoordinates}
                  onCheckedChange={(checked) => updateSetting('mobileShowCoordinates', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Animation Speed</Label>
                <Select 
                  value={settings.mobileAnimationSpeed} 
                  onValueChange={(value) => updateSetting('mobileAnimationSpeed', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fast">Fast</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="slow">Slow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Touch Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Touch Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="space-y-2">
                <Label className="text-sm">
                  Touch Sensitivity: {settings.touchSensitivity.toFixed(1)}
                </Label>
                <Slider
                  value={[settings.touchSensitivity]}
                  onValueChange={([value]) => updateSetting('touchSensitivity', value)}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">
                  Double-tap Delay: {settings.doubleTapDelay}ms
                </Label>
                <Slider
                  value={[settings.doubleTapDelay]}
                  onValueChange={([value]) => updateSetting('doubleTapDelay', value)}
                  min={200}
                  max={500}
                  step={50}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">
                  Long Press Delay: {settings.longPressDelay}ms
                </Label>
                <Slider
                  value={[settings.longPressDelay]}
                  onValueChange={([value]) => updateSetting('longPressDelay', value)}
                  min={300}
                  max={1000}
                  step={100}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Performance Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Battery className="w-4 h-4" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="flex items-center justify-between">
                <Label htmlFor="reduced-animations" className="text-sm">Reduced Animations</Label>
                <Switch
                  id="reduced-animations"
                  checked={settings.reducedAnimations}
                  onCheckedChange={(checked) => updateSetting('reducedAnimations', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="low-power" className="text-sm">Low Power Mode</Label>
                <Switch
                  id="low-power"
                  checked={settings.lowPowerMode}
                  onCheckedChange={(checked) => updateSetting('lowPowerMode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="preload-assets" className="text-sm">Preload Assets</Label>
                <Switch
                  id="preload-assets"
                  checked={settings.preloadAssets}
                  onCheckedChange={(checked) => updateSetting('preloadAssets', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Layout Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Layout
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="flex items-center justify-between">
                <Label htmlFor="compact-mode" className="text-sm">Compact Mode</Label>
                <Switch
                  id="compact-mode"
                  checked={settings.compactMode}
                  onCheckedChange={(checked) => updateSetting('compactMode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="hide-non-essential" className="text-sm">Hide Non-Essential UI</Label>
                <Switch
                  id="hide-non-essential"
                  checked={settings.hideNonEssentialUI}
                  onCheckedChange={(checked) => updateSetting('hideNonEssentialUI', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={resetToDefaults}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            
            <Button
              onClick={onClose}
              size="sm"
              className="flex-1"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Mobile settings quick access panel
export function MobileSettingsQuickAccess() {
  const deviceInfo = useDeviceDetection();
  const { settings, updateSetting } = useDeviceStore();

  if (!deviceInfo.isMobile) return null;

  return (
    <div className="mobile-quick-settings p-2 bg-amber-800/30 rounded-lg backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-300" />
          <span className="text-xs text-amber-200">Quick Settings</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Reduced Animations Toggle */}
          <div className="flex items-center gap-1">
            <label className="text-xs text-amber-200">Fast</label>
            <Switch
              size="sm"
              checked={settings.reducedAnimations}
              onCheckedChange={(checked) => updateSetting('reducedAnimations', checked)}
            />
          </div>
          
          {/* Compact Mode Toggle */}
          <div className="flex items-center gap-1">
            <label className="text-xs text-amber-200">Compact</label>
            <Switch
              size="sm"
              checked={settings.compactMode}
              onCheckedChange={(checked) => updateSetting('compactMode', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}