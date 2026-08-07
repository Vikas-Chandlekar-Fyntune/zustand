export type Department =
  | "Engineering"
  | "Design"
  | "Marketing"
  | "Business"
  | "Data Science";

export interface Student {
  id: string;
  name: string;
  email: string;
  department: Department;
  gpa: number;
  enrollmentDate: string;
}

export interface FilterState {
  search: string;
  department: Department | "All";
  sortBy: "name" | "gpa" | "enrollmentDate";
  sortOrder: "asc" | "desc";
  page: number;
}

// 30 Dummy Students for realistic data set
export const DUMMY_STUDENTS: Student[] = [
  {
    id: "1",
    name: "Alice Smith",
    email: "alice@univ.edu",
    department: "Engineering",
    gpa: 3.8,
    enrollmentDate: "2023-09-01",
  },
  {
    id: "2",
    name: "Bob Jones",
    email: "bob@univ.edu",
    department: "Design",
    gpa: 3.4,
    enrollmentDate: "2023-09-02",
  },
  {
    id: "3",
    name: "Charlie Brown",
    email: "charlie@univ.edu",
    department: "Marketing",
    gpa: 3.9,
    enrollmentDate: "2022-01-15",
  },
  {
    id: "4",
    name: "Diana Prince",
    email: "diana@univ.edu",
    department: "Business",
    gpa: 3.2,
    enrollmentDate: "2024-02-10",
  },
  {
    id: "5",
    name: "Evan Wright",
    email: "evan@univ.edu",
    department: "Data Science",
    gpa: 3.7,
    enrollmentDate: "2023-09-01",
  },
  {
    id: "6",
    name: "Fiona Gallagher",
    email: "fiona@univ.edu",
    department: "Engineering",
    gpa: 2.9,
    enrollmentDate: "2023-05-12",
  },
  {
    id: "7",
    name: "George Clark",
    email: "george@univ.edu",
    department: "Design",
    gpa: 3.5,
    enrollmentDate: "2022-09-01",
  },
  {
    id: "8",
    name: "Hannah Abbott",
    email: "hannah@univ.edu",
    department: "Marketing",
    gpa: 3.6,
    enrollmentDate: "2024-01-20",
  },
  {
    id: "9",
    name: "Ian Malcolm",
    email: "ian@univ.edu",
    department: "Data Science",
    gpa: 4.0,
    enrollmentDate: "2021-09-01",
  },
  {
    id: "10",
    name: "Julia Roberts",
    email: "julia@univ.edu",
    department: "Business",
    gpa: 3.1,
    enrollmentDate: "2023-11-05",
  },
  {
    id: "11",
    name: "Kevin Mitnick",
    email: "kevin@univ.edu",
    department: "Engineering",
    gpa: 3.85,
    enrollmentDate: "2023-09-01",
  },
  {
    id: "12",
    name: "Laura Croft",
    email: "laura@univ.edu",
    department: "Design",
    gpa: 3.45,
    enrollmentDate: "2022-03-14",
  },
  {
    id: "13",
    name: "Michael Scott",
    email: "michael@univ.edu",
    department: "Business",
    gpa: 2.5,
    enrollmentDate: "2021-08-25",
  },
  {
    id: "14",
    name: "Natalie Portman",
    email: "natalie@univ.edu",
    department: "Marketing",
    gpa: 3.95,
    enrollmentDate: "2023-09-01",
  },
  {
    id: "15",
    name: "Oliver Twist",
    email: "oliver@univ.edu",
    department: "Engineering",
    gpa: 3.0,
    enrollmentDate: "2024-05-01",
  },
  {
    id: "16",
    name: "Penelope Cruz",
    email: "penelope@univ.edu",
    department: "Data Science",
    gpa: 3.72,
    enrollmentDate: "2023-02-28",
  },
  {
    id: "17",
    name: "Quinn Harley",
    email: "quinn@univ.edu",
    department: "Design",
    gpa: 3.3,
    enrollmentDate: "2023-09-01",
  },
  {
    id: "18",
    name: "Ryan Reynolds",
    email: "ryan@univ.edu",
    department: "Business",
    gpa: 3.65,
    enrollmentDate: "2022-09-10",
  },
  {
    id: "19",
    name: "Sarah Connor",
    email: "sarah@univ.edu",
    department: "Engineering",
    gpa: 3.88,
    enrollmentDate: "2022-01-05",
  },
  {
    id: "20",
    name: "Tony Stark",
    email: "tony@univ.edu",
    department: "Engineering",
    gpa: 4.0,
    enrollmentDate: "2021-09-01",
  },
  {
    id: "21",
    name: "Ursula Buffay",
    email: "ursula@univ.edu",
    department: "Marketing",
    gpa: 2.8,
    enrollmentDate: "2023-09-15",
  },
  {
    id: "22",
    name: "Victor Von",
    email: "victor@univ.edu",
    department: "Data Science",
    gpa: 3.91,
    enrollmentDate: "2023-08-11",
  },
  {
    id: "23",
    name: "Wendy Darling",
    email: "wendy@univ.edu",
    department: "Design",
    gpa: 3.42,
    enrollmentDate: "2024-01-10",
  },
  {
    id: "24",
    name: "Xavier Charles",
    email: "xavier@univ.edu",
    department: "Engineering",
    gpa: 3.97,
    enrollmentDate: "2021-09-01",
  },
  {
    id: "25",
    name: "Yolanda Hadid",
    email: "yolanda@univ.edu",
    department: "Business",
    gpa: 3.15,
    enrollmentDate: "2023-06-20",
  },
  {
    id: "26",
    name: "Zack Morris",
    email: "zack@univ.edu",
    department: "Marketing",
    gpa: 3.35,
    enrollmentDate: "2022-09-01",
  },
  {
    id: "27",
    name: "Arthur Dent",
    email: "arthur@univ.edu",
    department: "Engineering",
    gpa: 3.05,
    enrollmentDate: "2023-10-01",
  },
  {
    id: "28",
    name: "Bruce Wayne",
    email: "bruce@univ.edu",
    department: "Business",
    gpa: 3.99,
    enrollmentDate: "2021-05-20",
  },
  {
    id: "29",
    name: "Clark Kent",
    email: "clark@univ.edu",
    department: "Marketing",
    gpa: 3.75,
    enrollmentDate: "2022-04-12",
  },
  {
    id: "30",
    name: "Diana Ross",
    email: "diana.r@univ.edu",
    department: "Design",
    gpa: 3.6,
    enrollmentDate: "2023-07-07",
  },
];
