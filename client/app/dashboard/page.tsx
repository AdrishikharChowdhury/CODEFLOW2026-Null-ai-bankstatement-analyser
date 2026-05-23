import { currentUser } from '@clerk/nextjs/server';
import React from 'react'

const page = async () => {

  const user = await currentUser();
  if (!user) throw new Error("Not Authorized");
  const firstName = user.firstName;
  const lastName = user.lastName;
  return (
    <main className='w-full flex flex-col' >
      <p className='w-full text-left' >Hello, <span className='text-2xl text-green-pea-200' >{firstName} {lastName}</span></p>
    </main>
  )
}

export default page
