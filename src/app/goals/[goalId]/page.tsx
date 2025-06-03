type GoalPageProps = {
  params: {
    goalId: string;
  };
};

export default function GoalPage({ params }: GoalPageProps) {
  return (
    <div>
      <h1>Goal: {params.goalId}</h1>
      <p>This is the page for a specific goal.</p>
    </div>
  );
}
