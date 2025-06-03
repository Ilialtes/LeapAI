type CheckinPageProps = {
  params: {
    goalId: string;
  };
};

export default function CheckinPage({ params }: CheckinPageProps) {
  return (
    <div>
      <h1>Check-in for Goal: {params.goalId}</h1>
      <p>This is the page for checking in on a specific goal.</p>
    </div>
  );
}
