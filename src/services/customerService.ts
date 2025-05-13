
import { Customer } from '@/types/customer';

// API base URL - adjust this to match your Python backend URL
const API_BASE_URL = 'http://localhost:5000'; // Change this to your Python API endpoint

// Get customers from backend
export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/customers`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch customers');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching customers:", error);
    // Return mock data as fallback
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
  }
};

// Update customer status
export const updateCustomerStatus = async (
  id: number, 
  status: Customer['status'],
  feedback?: number
): Promise<Customer> => {
  try {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, feedback }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update customer');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Updating customer ${id} to status ${status} with feedback ${feedback}`, error);
    
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
