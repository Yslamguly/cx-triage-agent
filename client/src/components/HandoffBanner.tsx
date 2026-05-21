import { HandoffInfo } from "../types";

interface Props {
  handoff: HandoffInfo;
}

export function HandoffBanner({ handoff }: Props) {
  return (
    <div className="handoff-banner">
      <div className="handoff-icon">⚠️</div>
      <div className="handoff-content">
        <h3>Conversation escalated to human agent</h3>
        <div className="handoff-details">
          <div className="handoff-field">
            <strong>Reason:</strong> {handoff.reason}
          </div>
          <div className="handoff-field">
            <strong>Customer intent:</strong> {handoff.customerIntent}
          </div>
          {handoff.actionsTaken.length > 0 && (
            <div className="handoff-field">
              <strong>Actions taken:</strong> {handoff.actionsTaken.join(", ")}
            </div>
          )}
          <div className="handoff-field">
            <strong>Summary:</strong> {handoff.summary}
          </div>
        </div>
      </div>
    </div>
  );
}
