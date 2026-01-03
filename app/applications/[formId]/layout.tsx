import { ApplicationFormProvider } from '@/components/application/context';
import { ApplicationNavbar } from '@/components/application/navbar';
import type { Id } from '@/convex/_generated/dataModel';

export default async function RouteComponent({
  params,
  children,
}: {
  params: Promise<{
    formId: Id<'applicationForms'>;
  }>;
  children: React.ReactNode;  
}) {
  const formId = (await params).formId;
  return (
    <div>
      <ApplicationFormProvider formId={formId}>
        <ApplicationNavbar id={formId} />
        {children}
      </ApplicationFormProvider>
    </div>
  );
}
