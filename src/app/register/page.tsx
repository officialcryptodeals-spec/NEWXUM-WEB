import Link from 'next/link';

export default function RegisterPage() {
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
              <div className="text-sm font-semibold text-blue-100/70 mb-2">NEXUM CAMP SYSTEM V2.5</div>
              <h1 className="text-5xl font-bold text-white mb-3">Nexum</h1>
              <p className="text-blue-100/80 text-base">Join the platform securing Redemption City</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-1 h-1 bg-[#FFA500] rounded-full mt-2"></div>
                <p className="text-blue-100/90">Serving 5M+ worshippers</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1 h-1 bg-[#FFA500] rounded-full mt-2"></div>
                <p className="text-blue-100/90">Covering 2,500 hectares</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1 h-1 bg-[#FFA500] rounded-full mt-2"></div>
                <p className="text-blue-100/90">3-second emergency dispatch</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1 h-1 bg-[#FFA500] rounded-full mt-2"></div>
                <p className="text-blue-100/90">24/7 operations</p>
              </div>
            </div>
          </div>

          {/* Footer Quote */}
          <div className="relative z-10 border-t border-blue-400/30 pt-6">
            <p className="text-sm text-blue-100/70">Real-time emergency dispatch, automated escalation, and crowd coordination for the world's largest regular gathering</p>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="bg-white flex flex-col justify-center px-12 relative">
          {/* Decorative Header */}
          <div className="mb-10">
            <div className="text-sm font-semibold text-slate-500 mb-1">CREATE YOUR ACCOUNT</div>
            <h2 className="text-3xl font-bold text-slate-900">Get Started</h2>
            <p className="text-slate-600 mt-2">Select your role</p>
          </div>

          {/* Role Cards */}
          <div className="space-y-4 mb-8">
            <Link href="/register/worshipper" className="block p-4 border border-slate-200 rounded-lg hover:border-[#0047AB] hover:bg-blue-50 transition">
              <div className="font-semibold text-slate-900">Worshipper</div>
              <p className="text-sm text-slate-600 mt-1">Book accommodation, report incidents</p>
            </Link>
            <Link href="/register/responder" className="block p-4 border border-slate-200 rounded-lg hover:border-[#0047AB] hover:bg-blue-50 transition">
              <div className="font-semibold text-slate-900">Emergency Responder</div>
              <p className="text-sm text-slate-600 mt-1">Medical & security officers</p>
            </Link>
            <Link href="/register/admin" className="block p-4 border border-slate-200 rounded-lg hover:border-[#0047AB] hover:bg-blue-50 transition">
              <div className="font-semibold text-slate-900">Administrator</div>
              <p className="text-sm text-slate-600 mt-1">Manage camp operations</p>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="text-center border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <a href="/login" className="text-[#0047AB] font-semibold hover:underline">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
