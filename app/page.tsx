import Login from 'lib/components/blocks/login';
import { verifyJWT } from 'lib/utils/jwt';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const cookieStore = cookies();
  const token: any = cookieStore.get('user-token')?.value;
  if (token) {
    const decode = await verifyJWT(token);
    if (decode) {
      const { role } = decode;
      // original redirect on login
      // if (role == 'ADMIN') {
      //   return redirect('/admin/dashboard');
      // } else if (role == 'SUPER_ADMIN' || role == 'SUPER ADMIN') {
      //   return redirect('/superAdmin/dashboard');
      // } else {
      //   return redirect('/employee/dashboard');
      // }
      if(role=='SUPER_ADMIN' || role=='SUPER ADMIN'){
        return redirect('/superAdmin/dashboard');
      }else{
        return redirect('/page/dashboard');
      }
    }
  }

  return (
    <main>

      <Login />
    </main>
  );
}
