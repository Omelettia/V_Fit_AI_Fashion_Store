import { useSearchParams, useNavigate } from 'react-router-dom';

export default function PaymentSuccessPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get('orderId');

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50">
            <div className="p-8 bg-white border rounded-2xl border-zinc-200 shadow-sm text-center">
                <h1 className="text-4xl font-black italic uppercase tracking-tighter text-zinc-900 mb-4">
                    Payment Successful!
                </h1>
                <p className="text-zinc-600 mb-8">
                    Thank you for your order #<span className="font-bold text-zinc-900">{orderId}</span>.
                </p>
                <button 
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-zinc-900 text-white font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                >
                    Back to Shopping
                </button>
            </div>
        </div>
    );
}