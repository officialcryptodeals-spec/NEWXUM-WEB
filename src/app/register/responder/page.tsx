import { RegisterForm } from '@/components/shared/LoginForm';

export default function ResponderRegisterPage() {
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
              <div className="text-sm font-semibold text-blue-100/70 mb-2">JOIN AS A RESPONDER</div>
              <h1 className="text-5xl font-bold text-white mb-3">Operations Hub</h1>
              <p className="text-blue-100/80 text-base">Real-time emergency response coordination</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-1 h-1 bg-[#FFA500] rounded-full mt-2"></div>
                <p className="text-blue-100/90">Receive dispatch alerts instantly</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1 h-1 bg-[#FFA500] rounded-full mt-2"></div>
                <p className="text-blue-100/90">Manage incident response</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1 h-1 bg-[#FFA500] rounded-full mt-2"></div>
                <p className="text-blue-100/90">Coordinate missing persons</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1 h-1 bg-[#FFA500] rounded-full mt-2"></div>
                <p className="text-blue-100/90">Secure officer communication</p>
              </div>
            </div>
          </div>

          {/* Footer Quote */}
          <div className="relative z-10 border-t border-blue-400/30 pt-6">
            <p className="text-sm text-blue-100/70">Empowering emergency responders with real-time intelligence</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="bg-white flex flex-col justify-center px-12 relative">
          {/* Decorative Header */}
          <div className="mb-10">
            <div className="text-sm font-semibold text-slate-500 mb-1">CREATE ACCOUNT</div>
            <h2 className="text-3xl font-bold text-slate-900">Join as Responder</h2>
            <p className="text-slate-600 mt-2">For medical & security officers</p>
          </div>

          {/* Form */}
          <div className="mb-8">
            <RegisterForm role="responder" />
          </div>

          {/* Quick Links */}
          <div className="text-center border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <a href="/login/responder" className="text-[#0047AB] font-semibold hover:underline">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
