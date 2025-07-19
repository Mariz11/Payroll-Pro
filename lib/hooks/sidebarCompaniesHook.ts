import { useQuery } from '@tanstack/react-query';

const useSidebarCompaniesHook = () => {
  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ['superAdminSidebarCompanyList'],
    queryFn: () =>
      fetch('/api/sidebar/companies?offset=0&limit=10', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT}`,
        },
      })
        .then((res) => res.json())
        .catch((err) => {
          console.error(err);
          throw err;
        }),
  });

  return { isLoading, error, data, refetch };
};

export default useSidebarCompaniesHook;
