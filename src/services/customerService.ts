
import { Customer } from '@/types/customer';

// Mock data - no backend required
const mockCustomers: Customer[] = [
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
  },
  {
    id: 6,
    user: "ليلى عبدالله",
    ticket_id: "TK-12350",
    issue: "استفسار عن الخدمات",
    status: "pending"
  },
  {
    id: 7,
    user: "عمر محمود",
    ticket_id: "TK-12351",
    issue: "مشكلة في الدفع",
    status: "resolved",
    feedback: 5
  }
];

// Mock database in localStorage
const initMockData = () => {
  const storedCustomers = localStorage.getItem('mock-customers');
  if (!storedCustomers) {
    localStorage.setItem('mock-customers', JSON.stringify(mockCustomers));
  }
};

// Initialize mock data
initMockData();

// Get customers from mock database
export const getCustomers = async (): Promise<Customer[]> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const storedCustomers = localStorage.getItem('mock-customers');
    return storedCustomers ? JSON.parse(storedCustomers) : mockCustomers;
  } catch (error) {
    console.error("Error fetching customers:", error);
    return mockCustomers;
  }
};

// Update customer status
export const updateCustomerStatus = async (
  id: number, 
  status: Customer['status'],
  feedback?: number
): Promise<Customer> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get current customers
    const storedCustomers = localStorage.getItem('mock-customers');
    const customers: Customer[] = storedCustomers ? JSON.parse(storedCustomers) : mockCustomers;
    
    // Find and update the specific customer
    const updatedCustomers = customers.map(customer => {
      if (customer.id === id) {
        return {
          ...customer,
          status,
          ...(feedback !== undefined ? { feedback } : {})
        };
      }
      return customer;
    });
    
    // Save back to storage
    localStorage.setItem('mock-customers', JSON.stringify(updatedCustomers));
    
    // Return the updated customer
    const updatedCustomer = updatedCustomers.find(c => c.id === id);
    if (!updatedCustomer) {
      throw new Error(`Customer with ID ${id} not found`);
    }
    
    return updatedCustomer;
  } catch (error) {
    console.error(`Error updating customer ${id}:`, error);
    
    // Return mock updated customer as fallback
    return {
      id,
      user: "محمد أحمد", 
      ticket_id: "TK-12345",
      issue: "مشكلة في الاتصال بالإنترنت",
      status,
      feedback
    };
  }
};
