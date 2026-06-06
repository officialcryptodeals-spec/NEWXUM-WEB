import { LoginForm } from '@/components/shared/LoginForm';

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Main Container */}
      <div className="grid grid-cols-2 min-h-screen">
        {/* Left Side - Branding */}
        <div className="bg-gradient-to-br from-[#0047AB] to-[#003580] relative overflow-hidden flex flex-col justify-between p-12">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

          {/* Content */}
          <div className="relative z-10">
            <div className="mb-12">
              <div className="text-sm font-semibold text-blue-100/70 mb-2">NEXUM ADMIN PORTAL</div>
              <h1 className="text-5xl font-bold text-white mb-3">Command Center</h1>
              <p className="text-blue-100/80 text-base">Camp operations & system control</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-1 h-1 bg-[#FFA500] rounded-full mt-2"></div>
                <p className="text-blue-100/90">Full operations management</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1 h-1 bg-[#FFA500] rounded-full mt-2"></div>
                <p className="text-blue-100/90">Monitor all incidents & alerts</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1 h-1 bg-[#FFA500] rounded-full mt-2"></div>
                <p className="text-blue-100/90">Property & booking control</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1 h-1 bg-[#FFA500] rounded-full mt-2"></div>
                <p className="text-blue-100/90">Geofencing & transit admin</p>
              </div>
            </div>
          </div>

          {/* Footer Quote */}
          <div className="relative z-10 border-t border-blue-400/30 pt-6">
            <p className="text-sm text-blue-100/70">Administrative control for camp-wide coordination and safety</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="bg-white flex flex-col justify-center px-12 relative">
          {/* Decorative Header */}
          <div className="mb-10">
            <div className="text-sm font-semibold text-slate-500 mb-1">ADMIN SIGN IN</div>
            <h2 className="text-3xl font-bold text-slate-900">Administrator Access</h2>
            <p className="text-slate-600 mt-2">HQ credentials required</p>
          </div>

          {/* Form */}
          <div className="mb-8">
            <LoginForm role="admin" callbackUrl="/admin/dashboard" />
          </div>

          {/* Quick Links */}
          <div className="text-center text-sm mb-4">
            <a href="/login" className="text-[#0047AB] font-semibold hover:underline">← Back to role selection</a>
          </div>

          {/* Register Link */}
          <div className="text-center border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-600">
              Need admin access?{' '}
              <a href="/register/admin" className="text-[#0047AB] font-semibold hover:underline">
                Request account
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
