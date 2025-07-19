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
      if (role == 'ADMIN') {
        return redirect('/admin/dashboard');
      } else if (role == 'SUPER_ADMIN') {
        return redirect('/superAdmin/dashboard');
      } else {
        return redirect('/employee/dashboard');
      }
    }
  }

  return (
    <main>

      <Login />
    </main>
  );
}
