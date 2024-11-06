import React from 'react';
import { AlertTriangle, Flame, AlertOctagon, Gauge, ThermometerSun } from 'lucide-react';
import { Emergency } from '../hooks/useEmergencyScenario';

interface EmergencyAlertProps {
  emergency: Emergency;
  onRespond: () => void;
}

const getEmergencyIcon = (type: Emergency['type'], severity: Emergency['severity']) => {
  switch (type) {
    case 'fire':
      return <Flame className="w-6 h-6 flex-shrink-0 mt-1 animate-pulse" />;
    case 'explosion':
      return <AlertOctagon className="w-6 h-6 flex-shrink-0 mt-1 animate-pulse" />;
    case 'structural':
      return <Gauge className="w-6 h-6 flex-shrink-0 mt-1" />;
    case 'operational':
      return <ThermometerSun className="w-6 h-6 flex-shrink-0 mt-1" />;
    default:
      return <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-1" />;
  }
};

const getEmergencyColor = (type: Emergency['type'], severity: Emergency['severity']) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-600';
    case 'high':
      return type === 'fire' ? 'bg-orange-600' : 'bg-red-500';
    case 'medium':
      return 'bg-yellow-600';
    case 'low':
      return 'bg-yellow-500';
    default:
      return 'bg-red-600';
  }
};

export const EmergencyAlert: React.FC<EmergencyAlertProps> = ({ emergency, onRespond }) => {
  const bgColor = getEmergencyColor(emergency.type, emergency.severity);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className={`w-96 ${bgColor} text-white p-6 rounded-lg shadow-lg`}>
        <div className="flex items-start gap-3">
          {getEmergencyIcon(emergency.type, emergency.severity)}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-lg">{emergency.title}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${
                emergency.severity === 'critical' ? 'bg-red-800' : 
                emergency.severity === 'high' ? 'bg-red-700' :
                emergency.severity === 'medium' ? 'bg-yellow-700' :
                'bg-yellow-600'
              }`}>
                {emergency.severity.toUpperCase()}
              </span>
            </div>
            <p className="text-sm mb-4">{emergency.description}</p>
            {emergency.systemResponse && (
              <div className={`text-sm mb-4 p-2 rounded ${
                emergency.systemResponse.status === 'success' ? 'bg-green-800' : 
                emergency.systemResponse.status === 'partial' ? 'bg-yellow-800' :
                'bg-red-800'
              }`}>
                <p className="font-medium">Estado del Sistema:</p>
                <p>{emergency.systemResponse.message}</p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={onRespond}
                className={`px-4 py-2 bg-white rounded hover:bg-opacity-90 transition-colors font-medium ${
                  emergency.severity === 'critical' ? 'text-red-600' :
                  emergency.severity === 'high' ? 'text-orange-600' :
                  'text-yellow-600'
                }`}
              >
                Iniciar Protocolo de Emergencia
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};