interface SettingsGroupProps {
    title: string;
    children: React.ReactNode;
}

function SettingsGroup({ title, children }: SettingsGroupProps) {
    return (
        <div className="border border-slate-700 rounded-xl overflow-hidden">
            <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700">
                <h3 className="font-semibold text-slate-200">{title}</h3>
            </div>
            <div className="p-4 bg-slate-900/30 space-y-4">
                {children}
            </div>
        </div>
    );
}

function SettingItem({ label, description, enabled }: { label: string; description: string; enabled: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="font-medium text-white">{label}</p>
                <p className="text-sm text-slate-400">{description}</p>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${enabled ? 'bg-emerald-500' : 'bg-slate-700'
                }`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'
                    }`} />
            </div>
        </div>
    );
}

export function SettingsTab() {
    return (
        <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800 p-6 animate-fadeIn space-y-4">
            <SettingsGroup title="Security">
                <SettingItem label="Two-Factor Authentication" description="Require 2FA for all super admins" enabled={false} />
                <SettingItem label="Session Timeout" description="Auto-logout after 8 hours of inactivity" enabled={true} />
            </SettingsGroup>
            <SettingsGroup title="Notifications">
                <SettingItem label="Email Alerts" description="Receive email for new admin requests" enabled={true} />
                <SettingItem label="Push Notifications" description="Browser push notifications" enabled={false} />
            </SettingsGroup>
        </div>
    );
}
