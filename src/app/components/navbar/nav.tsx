import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Service Provider', href: '/serviceprovider'},
  { name: 'Request', href: '#'},
]

export default function Example() {
  return (
    <Disclosure as="nav" className="bg-black">
      <>
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-10">
          <div className="relative flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="mr-4 flex-shrink-0">
                <a className='text-white text-xl'>NearBy</a>
              </div>
              <div className="hidden lg:ml-6 lg:flex lg:space-x-2">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className='text-white rounded-full px-3 py-2 text-[15px] hover:bg-zinc-800'
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="text-white hover:bg-zinc-800 rounded-full px-3 py-2 text-[15px]">
                Log in
              </button>
              <button className="bg-white text-black hover:bg-gray-200 rounded-full px-4 py-2 text-sm font-medium">
                Sign up
              </button>
              <DisclosureButton className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                <span className="sr-only">Open main menu</span>
                <XMarkIcon aria-hidden="true" className="hidden h-6 w-6 group-data-[open]:block" />
                <Bars3Icon aria-hidden="true" className="block h-6 w-6 group-data-[open]:hidden" />
              </DisclosureButton>
            </div>
          </div>
        </div>

        <DisclosurePanel className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <DisclosureButton
                key={item.name}
                as="a"
                href={item.href}
                className=' text-gray-100 block rounded-md px-3 py-2 text-base font-medium hover:bg-zinc-800 hover:text-white'
              >
                {item.name}
              </DisclosureButton>
            ))}
          </div>
        </DisclosurePanel>
      </>
    </Disclosure>
  )
}