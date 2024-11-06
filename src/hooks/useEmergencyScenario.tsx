import { useState, useCallback, useRef } from 'react';

export type EmergencyType = 'operational' | 'fire' | 'structural' | 'explosion';

export interface Emergency {
  id: string;
  title: string;
  description: string;
  affectedTank: 1 | 2;
  action: 'transfer' | 'shutdown' | 'fire-response' | 'structural-response';
  targetLevel?: number;
  type: EmergencyType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  systemResponse?: {
    status: 'success' | 'failure' | 'partial';
    message: string;
  };
}

const SYSTEM_RESPONSES = {
  success: { status: 'success' as const, message: 'Sistema activado exitosamente' },
  failure: { status: 'failure' as const, message: 'Activación fallida - Iniciando sistema secundario' },
  partial: { status: 'partial' as const, message: 'Respuesta parcial - Requiere intervención manual' }
};

const EMERGENCY_SCENARIOS: Emergency[] = [
  // Structural Emergencies
  {
    id: 'pipe-rupture-1',
    title: '¡Ruptura de Tubería!',
    description: 'Ruptura detectada en la tubería principal del Tanque 1. Pérdida de presión crítica.',
    affectedTank: 1,
    action: 'structural-response',
    type: 'structural',
    severity: 'high'
  },
  {
    id: 'pipe-rupture-2',
    title: '¡Falla Estructural!',
    description: 'Múltiples puntos de fuga detectados en conexiones del Tanque 2.',
    affectedTank: 2,
    action: 'structural-response',
    type: 'structural',
    severity: 'critical'
  },
  
  // Operational Emergencies
  {
    id: 'pressure-loss-1',
    title: '¡Pérdida de Presión!',
    description: 'Caída súbita de presión en Tanque 1. Nivel crítico alcanzado.',
    affectedTank: 1,
    action: 'transfer',
    targetLevel: 50,
    type: 'operational',
    severity: 'medium'
  },
  {
    id: 'overflow-risk-2',
    title: '¡Riesgo de Desbordamiento!',
    description: 'Nivel de Tanque 2 excede límites seguros. Transferencia inmediata requerida.',
    affectedTank: 2,
    action: 'transfer',
    targetLevel: 70,
    type: 'operational',
    severity: 'high'
  },
  
  // Fire Emergencies
  {
    id: 'fire-1',
    title: '¡ALERTA DE INCENDIO!',
    description: 'Temperatura crítica en Tanque 1. Sistema contra incendios activado.',
    affectedTank: 1,
    action: 'fire-response',
    type: 'fire',
    severity: 'critical'
  },
  {
    id: 'fire-2',
    title: '¡INCENDIO EN VÁLVULAS!',
    description: 'Fuego detectado en sistema de válvulas del Tanque 2.',
    affectedTank: 2,
    action: 'fire-response',
    type: 'fire',
    severity: 'high'
  },
  
  // Explosion Risk
  {
    id: 'explosion-risk-1',
    title: '¡RIESGO DE EXPLOSIÓN!',
    description: 'Presión y temperatura críticas en Tanque 1. ¡Evacuación inmediata!',
    affectedTank: 1,
    action: 'shutdown',
    type: 'explosion',
    severity: 'critical'
  },
  {
    id: 'explosion-risk-2',
    title: '¡PELIGRO DE EXPLOSIÓN!',
    description: 'Reacción química detectada en Tanque 2. Riesgo de explosión inminente.',
    affectedTank: 2,
    action: 'shutdown',
    type: 'explosion',
    severity: 'critical'
  }
];

interface UseEmergencyScenarioProps {
  tank1Level: number;
  tank2Level: number;
  setTank1Level: (value: number) => void;
  setTank2Level: (value: number) => void;
  setIsFlowing: (value: boolean) => void;
  setTank1Temps: (internal: number, external: number) => void;
  setTank2Temps: (internal: number, external: number) => void;
}

export const useEmergencyScenario = ({
  tank1Level,
  tank2Level,
  setTank1Level,
  setTank2Level,
  setIsFlowing,
  setTank1Temps,
  setTank2Temps,
}: UseEmergencyScenarioProps) => {
  const [emergency, setEmergency] = useState<Emergency | null>(null);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const currentScenarioIndex = useRef(0);

  const triggerNextEmergency = useCallback(() => {
    const scenario = {...EMERGENCY_SCENARIOS[currentScenarioIndex.current]};
    
    // Add appropriate system response based on emergency type
    switch (scenario.type) {
      case 'fire':
        scenario.systemResponse = Math.random() > 0.3 ? SYSTEM_RESPONSES.success : SYSTEM_RESPONSES.failure;
        const maxTemp = Math.floor(Math.random() * 3000) + 2000;
        if (scenario.affectedTank === 1) {
          setTank1Temps(maxTemp, maxTemp * 0.7);
        } else {
          setTank2Temps(maxTemp, maxTemp * 0.7);
        }
        break;
        
      case 'structural':
        scenario.systemResponse = Math.random() > 0.5 ? SYSTEM_RESPONSES.partial : SYSTEM_RESPONSES.failure;
        break;
        
      case 'explosion':
        scenario.systemResponse = SYSTEM_RESPONSES.critical;
        const criticalTemp = Math.floor(Math.random() * 5000) + 3000;
        if (scenario.affectedTank === 1) {
          setTank1Temps(criticalTemp, criticalTemp * 0.8);
        } else {
          setTank2Temps(criticalTemp, criticalTemp * 0.8);
        }
        break;
    }
    
    setEmergency(scenario);
    setIsEmergencyActive(true);
    
    // Move to next scenario, loop back to start if at end
    currentScenarioIndex.current = (currentScenarioIndex.current + 1) % EMERGENCY_SCENARIOS.length;
  }, [setTank1Temps, setTank2Temps]);

  const handleEmergencyResponse = useCallback(() => {
    if (!emergency) return;

    switch (emergency.action) {
      case 'shutdown':
        setIsFlowing(false);
        if (emergency.affectedTank === 1) {
          setTank1Temps(25, 25);
        } else {
          setTank2Temps(25, 25);
        }
        break;
        
      case 'fire-response':
        if (emergency.affectedTank === 1) {
          setTank1Temps(25, 25);
        } else {
          setTank2Temps(25, 25);
        }
        break;
        
      case 'transfer':
        if (emergency.targetLevel !== undefined) {
          const currentLevel = emergency.affectedTank === 1 ? tank1Level : tank2Level;
          const difference = currentLevel - emergency.targetLevel;
          
          if (emergency.affectedTank === 1) {
            setTank1Level(emergency.targetLevel);
            setTank2Level(Math.min(100, tank2Level + difference));
          } else {
            setTank2Level(emergency.targetLevel);
            setTank1Level(Math.min(100, tank1Level + difference));
          }
        }
        break;
        
      case 'structural-response':
        setIsFlowing(false);
        break;
    }

    setEmergency(null);
    setIsEmergencyActive(false);
  }, [emergency, tank1Level, tank2Level, setTank1Level, setTank2Level, setIsFlowing, setTank1Temps, setTank2Temps]);

  return {
    emergency,
    isEmergencyActive,
    triggerRandomEmergency: triggerNextEmergency, // Keep the same function name for compatibility
    handleEmergencyResponse,
  };
};