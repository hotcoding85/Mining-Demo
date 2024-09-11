export interface DraggableItem {
  id: string;
  name: string;
  label: string;
}

export interface Events {
  id: number;
  title: string;
  workLocation?: string;
  serviceInterval?: string;
  resourceLabor?: string;
  reason?: string;
  start: Date;
  end: Date;
}

export interface DraggedEvent {
  name: string;
  type: string;
}
