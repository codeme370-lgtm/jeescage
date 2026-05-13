export default function PricingPage() {
    return (
        <div className='mx-auto max-w-[700px] my-28 px-4'>
            <div className='rounded-3xl border border-slate-200 bg-white p-8 shadow-lg'>
                <h1 className='text-3xl font-bold text-slate-900 mb-4'>Pricing</h1>
                <p className='text-sm text-slate-600 leading-7'>Our plans are designed to help every seller launch and grow. Contact us for custom pricing.</p>
                <div className='mt-8 grid gap-6 sm:grid-cols-2'>
                    <div className='rounded-3xl border border-slate-200 p-6 bg-slate-50'>
                        <h2 className='text-xl font-semibold text-slate-900'>Starter</h2>
                        <p className='mt-2 text-sm text-slate-600'>Free store setup and basic features.</p>
                        <div className='mt-6 text-4xl font-bold text-slate-900'>Free</div>
                        <ul className='mt-4 space-y-2 text-sm text-slate-600'>
                            <li>Unlimited products</li>
                            <li>Basic analytics</li>
                            <li>Customer support</li>
                        </ul>
                    </div>
                    <div className='rounded-3xl border border-slate-200 p-6 bg-slate-50'>
                        <h2 className='text-xl font-semibold text-slate-900'>Pro</h2>
                        <p className='mt-2 text-sm text-slate-600'>Advanced tools for growing sellers.</p>
                        <div className='mt-6 text-4xl font-bold text-slate-900'>$29</div>
                        <div className='text-sm text-slate-500'>per month</div>
                        <ul className='mt-4 space-y-2 text-sm text-slate-600'>
                            <li>Priority support</li>
                            <li>Enhanced analytics</li>
                            <li>Store customization</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}