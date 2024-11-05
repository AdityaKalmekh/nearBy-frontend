import { Disclosure } from "@headlessui/react"

export default function loginNav() {
    return (
        <Disclosure as="nav" className="bg-black">
            <>
                <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-10">
                    <div className="relative flex h-14 items-center justify-between">
                        <div className="flex items-center">
                            <div className="mr-4 flex-shrink-0">
                                <a className='text-white text-xl'>NearBy</a>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        </Disclosure>
    )
}