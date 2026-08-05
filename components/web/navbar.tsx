import Link from 'next/link'
import { buttonVariants } from '../ui/button'
import { ThemeToggle } from './theme-toggle'

function Navbar() {
  return (
    <div className='justify-between items-center flex'>
        <div>
            {/* this is the section for the web name or log but we will be using text instead */}
            <Link href={'/'} className={buttonVariants(
                {variant:"ghost"}
            )}>
                <h1 className='text-3xl font-bold'>
                        Next
                    <span className='text-blue-400 text-3xl font-bold px-1.5'>
                        Pro
                    </span>
                </h1>
            </Link>
        </div>
        <div className='flex justify-between items-center'>          
            <ul className='flex gap-10 *:text-black *:text-sm'>
                <li className='hover:text-blue-400 cursor-pointer'>
                    <Link href={'/'} className={buttonVariants(
                        {variant:"link"}
                    )}>
                        Home
                    </Link>
                </li>
                <li className='hover:text-blue-400 cursor-pointer'>
                    <Link href={'/blog'} className={buttonVariants(
                        {variant:"link"}
                    )}>
                        Blog
                    </Link>
                </li>
                <li className='hover:text-blue-400 cursor-pointer'>
                    <Link href={'/create'} className={buttonVariants(
                        {variant:"link"}
                    )}>
                        Create
                    </Link>
                </li>
                <li className='hover:text-blue-400 cursor-pointer'>
                    <Link href={'/'} className={buttonVariants(
                        {variant:"link"}
                    )}>
                        Contact
                    </Link>
                </li>
            </ul>
        </div>
        <div className='flex gap-5'>
            <Link href={'auth/sign-up'} className={buttonVariants()}>
                Signup
            </Link>
           <Link href={'auth/sign-up'} className={buttonVariants(
                {variant:"outline"}
            )}>
                Login
            </Link>
            <ThemeToggle/>
        </div>
    </div>
  )
}

export default Navbar