import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';

interface Notification {
  reporteId: number;
  publicacionId: number;
  publicacionNombre: string;
  categoria: string;
}

const NotificationBell = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Verificar si el usuario es moderador o admin
  const isModerator = user?.roles?.some((r: string) =>
    r === 'MODERADOR' || r === 'ADMINISTRADOR'
  );

  console.log('[NotificationBell] User:', user);
  console.log('[NotificationBell] Roles:', user?.roles);
  console.log('[NotificationBell] isModerator:', isModerator);
  console.log('[NotificationBell] socket:', socket);

  useEffect(() => {
    console.log('[NotificationBell] useEffect triggered - socket:', socket, 'isModerator:', isModerator);

    if (!socket || !isModerator) {
      console.log('[NotificationBell] Skipping listener setup');
      return;
    }

    console.log('[NotificationBell] Socket connected?', socket.connected);
    console.log('[NotificationBell] Socket ID:', socket.id);
    console.log('[NotificationBell] Setting up Socket.IO listeners');

    // Escuchar nuevos reportes
    const handleNuevoReporte = (data: Notification) => {
      console.log('Nueva notificacion de reporte:', data);
      setNotifications(prev => [...prev, data]);
    };

    // Escuchar reportes revisados
    const handleReporteRevisado = (data: { reporteId: number }) => {
      console.log('Reporte revisado, cerrando notificacion:', data.reporteId);
      setNotifications(prev => prev.filter(n => n.reporteId !== data.reporteId));
    };

    socket.on('nuevo-reporte', handleNuevoReporte);
    socket.on('reporte-revisado', handleReporteRevisado);

    console.log('[NotificationBell] Listeners attached to socket');

    return () => {
      console.log('[NotificationBell] Cleaning up listeners');
      socket.off('nuevo-reporte', handleNuevoReporte);
      socket.off('reporte-revisado', handleReporteRevisado);
    };
  }, [socket, isModerator]);

  const handleNotificationClick = (notification: Notification) => {
    // ✅ Redirigir al panel apropiado según el rol
    const isAdmin = user?.roles?.includes("ADMINISTRADOR");
    const panelPath = isAdmin ? "/admin" : "/moderator";
    navigate(`${panelPath}?tab=reportes`);
    setIsOpen(false);
  };

  if (!isModerator) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {notifications.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-4">
          <h3 className="font-semibold text-sm mb-3">
            Reportes Pendientes ({notifications.length})
          </h3>

          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay reportes pendientes
            </p>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif) => (
                <button
                  key={notif.reporteId}
                  onClick={() => handleNotificationClick(notif)}
                  className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors border border-border"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Nueva denuncia
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notif.publicacionNombre}
                      </p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {notif.categoria.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
