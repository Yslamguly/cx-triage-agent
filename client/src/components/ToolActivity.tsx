const TOOL_DESCRIPTIONS: Record<string, string> = {
  lookup_order: "Looking up order details...",
  get_account_info: "Checking account information...",
  handoff_to_human: "Connecting to a human agent...",
};

interface Props {
  activeTools: string[];
}

export function ToolActivity({ activeTools }: Props) {
  if (activeTools.length === 0) return null;

  return (
    <div className="tool-activity">
      <div className="tool-activity-spinner" />
      <div className="tool-activity-text">
        {activeTools.map((tool, i) => (
          <div key={i}>{TOOL_DESCRIPTIONS[tool] || `Running ${tool}...`}</div>
        ))}
      </div>
    </div>
  );
}
