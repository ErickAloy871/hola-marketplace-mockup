import React from 'react';

interface PasswordStrengthProps {
    password: string;
}

export default function PasswordStrengthIndicator({ password }: PasswordStrengthProps) {
    const requirements = [
        { label: 'Mínimo 8 caracteres', test: (pass: string) => pass.length >= 8 },
        { label: 'Una letra mayúscula', test: (pass: string) => /[A-Z]/.test(pass) },
        { label: 'Una letra minúscula', test: (pass: string) => /[a-z]/.test(pass) },
        { label: 'Un número', test: (pass: string) => /[0-9]/.test(pass) },
        { label: 'Un carácter especial (!@#$%^&*)', test: (pass: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pass) }
    ];

    const passedCount = requirements.filter(req => req.test(password)).length;
    const strength = passedCount === 0 ? '' : passedCount <= 2 ? 'Débil' : passedCount === 4 ? 'Media' : 'Fuerte';
    const strengthColor = passedCount <= 2 ? 'text-destructive' : passedCount === 4 ? 'text-yellow-600' : 'text-green-600';

    if (!password) return null;

    return (
        <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Fortaleza:</span>
                <span className={`text-sm font-semibold ${strengthColor}`}>{strength}</span>
            </div>
            <div className="space-y-1">
                {requirements.map((req, index) => {
                    const isPassed = req.test(password);
                    return (
                        <div key={index} className="flex items-center gap-2 text-xs">
                            <span className={isPassed ? 'text-green-600' : 'text-muted-foreground'}>
                                {isPassed ? '✓' : '○'}
                            </span>
                            <span className={isPassed ? 'text-foreground' : 'text-muted-foreground'}>
                                {req.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
