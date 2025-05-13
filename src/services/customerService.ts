
import { Customer } from '@/types/customer';

// Mock customer data
export const getCustomers = (): Customer[] => {
  return [
    {
      id: 1,
      user: "محمد أحمد",
      ticket_id: "TK-12345",
      issue: "مشكلة في الاتصال بالإنترنت",
      status: "pending"
    },
    {
      id: 2,
      user: "سارة محمود",
      ticket_id: "TK-12346",
      issue: "عدم عمل التطبيق بشكل صحيح",
      status: "in_progress"
    },
    {
      id: 3,
      user: "أحمد علي",
      ticket_id: "TK-12347",
      issue: "فاتورة خاطئة",
      status: "resolved",
      feedback: 4
    },
    {
      id: 4,
      user: "فاطمة حسين",
      ticket_id: "TK-12348",
      issue: "مشكلة في الحساب",
      status: "pending"
    },
    {
      id: 5,
      user: "خالد محمد",
      ticket_id: "TK-12349",
      issue: "طلب استرداد",
      status: "in_progress"
    }
  ];
};

// Update customer status
export const updateCustomerStatus = (
  id: number, 
  status: Customer['status'],
  feedback?: number
): Customer => {
  // In a real app, this would call an API
  console.log(`Updating customer ${id} to status ${status} with feedback ${feedback}`);
  
  // Return mock updated customer
  return {
    id,
    user: "محمد أحمد", // This would come from the server in a real app
    ticket_id: "TK-12345",
    issue: "مشكلة في الاتصال بالإنترنت",
    status,
    feedback
  };
};
