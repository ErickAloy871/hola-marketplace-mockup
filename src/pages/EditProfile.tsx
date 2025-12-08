import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, User, Save, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';

export default function EditProfile() {
    const navigate = useNavigate();
    const { user, login, logout } = useAuth();

    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    const [canDeleteAccount, setCanDeleteAccount] = useState(false);

    // Cargar datos del usuario actual
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
            toast.error('Debes iniciar sesión');
            navigate('/auth?tab=login');
            return;
        }

        // ✅ VERIFICAR ROLES DEL USUARIO
        try {
            const userData = JSON.parse(userStr);
            const userRoles = userData.roles || [];
            
            // Convertir roles a mayúsculas para comparación
            const rolesUpperCase = userRoles.map((r: string) => r.toUpperCase());
            
            // Solo puede eliminar cuenta si es COMPRADOR o VENDEDOR
            // Y NO es MODERADOR ni ADMINISTRADOR
            const isModerador = rolesUpperCase.includes('MODERADOR');
            const isAdmin = rolesUpperCase.includes('ADMINISTRADOR');
            const isComprador = rolesUpperCase.includes('COMPRADOR');
            const isVendedor = rolesUpperCase.includes('VENDEDOR');
            
            // Puede eliminar si es comprador/vendedor Y NO es moderador/admin
            const canDelete = (isComprador || isVendedor) && !isModerador && !isAdmin;
            setCanDeleteAccount(canDelete);
            
            console.log('Roles del usuario:', userRoles);
            console.log('Puede eliminar cuenta:', canDelete);
        } catch (e) {
            console.error('Error al verificar roles:', e);
            setCanDeleteAccount(false);
        }

        const fetchUserData = async () => {
            try {
                const userData = JSON.parse(userStr);
                const response = await fetch(`http://localhost:4000/api/auth/profile/${userData.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setNombre(data.nombre || '');
                    setApellido(data.apellido || '');
                    setTelefono(data.telefono || '');
                    setDireccion(data.direccion || '');
                } else {
                    setNombre(userData.nombre || '');
                    setApellido(userData.apellido || '');
                }
            } catch (error) {
                console.error('Error al cargar datos:', error);
                try {
                    const userData = JSON.parse(userStr);
                    setNombre(userData.nombre || '');
                    setApellido(userData.apellido || '');
                } catch (e) {
                    console.error('Error parsing user data:', e);
                }
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!nombre || !apellido || !telefono || !direccion) {
            toast.error('Por favor, completa todos los campos');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');
            const userData = JSON.parse(userStr!);

            const response = await fetch('http://localhost:4000/api/auth/update-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    usuarioId: userData.id,
                    nombre,
                    apellido,
                    telefono,
                    direccion
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                login(token!, data.usuario);
                toast.success('¡Perfil actualizado exitosamente!');
                setTimeout(() => navigate('/'), 1500);
            } else {
                toast.error(data.message || 'Error al actualizar perfil');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    // FUNCIÓN: Eliminar cuenta
    const handleDeleteAccount = async () => {
        setDeleting(true);

        try {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');
            const userData = JSON.parse(userStr!);

            const response = await fetch('http://localhost:4000/api/auth/delete-account', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    usuarioId: userData.id
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success('Tu cuenta ha sido eliminada exitosamente');
                
                // Cerrar sesión y limpiar datos
                logout();
                
                // Redirigir al login después de 2 segundos
                setTimeout(() => {
                    navigate('/auth?tab=login');
                }, 2000);
            } else {
                toast.error(data.message || 'Error al eliminar cuenta');
                setShowDeleteConfirm(false);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error de conexión');
            setShowDeleteConfirm(false);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/')}
                    className="mb-6 text-foreground hover:text-primary"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al inicio
                </Button>

                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
                                <User className="w-10 h-10 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Editar Perfil
                        </h1>
                        <p className="text-sm text-muted-foreground mt-2">
                            Actualiza tu información personal
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-card rounded-2xl shadow-xl border-4 border-primary/30 p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email (no editable) */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-foreground font-semibold">
                                    Correo electrónico
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={(() => {
                                        try {
                                            const userStr = localStorage.getItem('user');
                                            if (userStr) {
                                                const userData = JSON.parse(userStr);
                                                return userData.correo || '';
                                            }
                                        } catch (e) {
                                            console.error(e);
                                        }
                                        return '';
                                    })()}
                                    disabled
                                    className="border-2 border-border bg-muted cursor-not-allowed"
                                />
                                <p className="text-xs text-muted-foreground">
                                    El correo no se puede modificar
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Nombre */}
                                <div className="space-y-2">
                                    <Label htmlFor="nombre" className="text-foreground font-semibold">
                                        Nombre
                                    </Label>
                                    <Input
                                        id="nombre"
                                        type="text"
                                        placeholder="Tu nombre"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        className="border-2 border-border focus:border-primary"
                                        required
                                    />
                                </div>

                                {/* Apellido */}
                                <div className="space-y-2">
                                    <Label htmlFor="apellido" className="text-foreground font-semibold">
                                        Apellido
                                    </Label>
                                    <Input
                                        id="apellido"
                                        type="text"
                                        placeholder="Tu apellido"
                                        value={apellido}
                                        onChange={(e) => setApellido(e.target.value)}
                                        className="border-2 border-border focus:border-primary"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Teléfono */}
                            <div className="space-y-2">
                                <Label htmlFor="telefono" className="text-foreground font-semibold">
                                    Teléfono
                                </Label>
                                <Input
                                    id="telefono"
                                    type="tel"
                                    placeholder="0991234567"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                    className="border-2 border-border focus:border-primary"
                                    required
                                />
                            </div>

                            {/* Dirección */}
                            <div className="space-y-2">
                                <Label htmlFor="direccion" className="text-foreground font-semibold">
                                    Dirección
                                </Label>
                                <Input
                                    id="direccion"
                                    type="text"
                                    placeholder="Tu dirección completa"
                                    value={direccion}
                                    onChange={(e) => setDireccion(e.target.value)}
                                    className="border-2 border-border focus:border-primary"
                                    required
                                />
                            </div>

                            {/* Botones */}
                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/')}
                                    className="flex-1"
                                    disabled={loading || deleting}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold"
                                    disabled={loading || deleting}
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                            </div>
                        </form>

                        {/* ✅ SECCIÓN DE ZONA PELIGROSA - SOLO SI PUEDE ELIMINAR */}
                        {canDeleteAccount && (
                            <div className="mt-8 pt-8 border-t-2 border-destructive/20">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                                        <div>
                                            <h3 className="text-lg font-bold text-destructive">
                                                Zona Peligrosa
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, está seguro.
                                            </p>
                                        </div>
                                    </div>

                                    {!showDeleteConfirm ? (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={() => setShowDeleteConfirm(true)}
                                            disabled={loading || deleting}
                                            className="w-full"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Eliminar mi cuenta
                                        </Button>
                                    ) : (
                                        <div className="bg-destructive/10 border-2 border-destructive rounded-lg p-4 space-y-4">
                                            <div className="text-center">
                                                <p className="font-bold text-destructive mb-2">
                                                    ⚠️ ¿Estás completamente seguro?
                                                </p>
                                                <p className="text-sm text-foreground">
                                                    Esta acción es <strong>permanente</strong> y no se puede deshacer.
                                                    Todos tus datos serán eliminados.
                                                </p>
                                            </div>
                                            <div className="flex gap-3">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setShowDeleteConfirm(false)}
                                                    disabled={deleting}
                                                    className="flex-1"
                                                >
                                                    Cancelar
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    onClick={handleDeleteAccount}
                                                    disabled={deleting}
                                                    className="flex-1 font-bold"
                                                >
                                                    {deleting ? 'Eliminando...' : 'Sí, eliminar definitivamente'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
