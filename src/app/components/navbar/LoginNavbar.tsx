import { Disclosure } from "@headlessui/react"

const LoginNavbar = () => {
    return (
        <Disclosure as="nav" className="bg-black">
            <>
                <div className="mx-auto max-w-7xl px-4">
                    <div className="relative flex h-14 items-center justify-between">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                {/* <a className='text-white text-2xl font-medium'>NearBy</a> */}
                                <a className='text-white text-xl'>NearBy</a>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        </Disclosure>
    )
}
export default LoginNavbar