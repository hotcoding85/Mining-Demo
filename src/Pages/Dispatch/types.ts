export interface OperatorStateProps {
    _type: string;
    createdAt: number;
    employeeId: string;
    firstName: string;
    id: string;
    lastName: string;
    password: string;
    role: string;
    status: string;
    updatedAt: number;
    skills: string[]; 

    username: string;
  }

  export interface equipmentStateProps {
    _type: "vehicle";
    category: string;
    createdAt: string;
    id: string;
    make: string;
    model: string;
    name: string;
    serial: string;
    state: string;
    status: string;
    updatedAt: string;
    capacity?: number;
    operator?:any[] | string;
  }
