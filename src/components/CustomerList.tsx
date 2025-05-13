
import React from 'react';
import { Customer } from '@/types/customer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CustomerListProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
}

const statusColors = {
  pending: "bg-yellow-200 text-yellow-800",
  in_progress: "bg-blue-200 text-blue-800",
  resolved: "bg-green-200 text-green-800"
};

const CustomerList: React.FC<CustomerListProps> = ({ customers, onSelectCustomer }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">قائمة العملاء</h2>
      {customers.map((customer) => (
        <Card key={customer.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">{customer.user}</CardTitle>
              <Badge className={statusColors[customer.status]}>
                {customer.status === 'pending' && 'قيد الانتظار'}
                {customer.status === 'in_progress' && 'جاري العمل'}
                {customer.status === 'resolved' && 'تم الحل'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><span className="font-semibold">رقم التذكرة:</span> {customer.ticket_id}</p>
              <p><span className="font-semibold">المشكلة:</span> {customer.issue}</p>
              {customer.feedback && (
                <p><span className="font-semibold">التقييم:</span> {customer.feedback}/5</p>
              )}
              <div className="flex justify-end mt-4">
                <Button 
                  onClick={() => onSelectCustomer(customer)} 
                  disabled={customer.status === 'resolved'}
                >
                  {customer.status === 'pending' ? 'بدء المكالمة' : 
                   customer.status === 'in_progress' ? 'متابعة المكالمة' : 
                   'تم الحل'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CustomerList;
