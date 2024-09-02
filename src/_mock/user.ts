import { firstName, lastName } from "./assets/name";

export const generateMockUserData = () => {
  const users = [...new Array(30)].map((_, i) => ({
    id: `e99f09a7-dd88-49d5-b1c8-1daf80c2d7b${i + 1}`,
    employeeId: (100 + i).toString(),
    firstName: firstName[i],
    lastName: lastName[i],
    password: "$2a$08$QMRjEC4vx3W1G3ASBPq9T.5AGI5Cv2mASBzGjUsNIzT50StKJLW9K",
    role: "OPERATOR",
    status: "ACTIVE",
    username: firstName[i],
  }));

  return users;
};
