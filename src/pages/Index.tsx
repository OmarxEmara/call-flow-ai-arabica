
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomerList from "@/components/CustomerList";
import CallInterface from "@/components/CallInterface";
import ApiKeyDialog from "@/components/ApiKeyDialog";
import { Customer } from "@/types/customer";
import { getCustomers, updateCustomerStatus } from "@/services/customerService";
import { toast } from "@/components/ui/sonner";

const Index = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch customers when component mounts
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        const result = await getCustomers();
        setCustomers(result);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
        toast.error("فشل في جلب بيانات العملاء");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomers();
  }, []);
  
  const handleSelectCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    // Update customer status to in_progress if it was pending
    if (customer.status === 'pending') {
      try {
        const updatedCustomer = await updateCustomerStatus(customer.id, 'in_progress');
        setCustomers(prev => 
          prev.map(c => c.id === customer.id ? updatedCustomer : c)
        );
      } catch (error) {
        console.error("Failed to update customer status:", error);
        toast.error("فشل في تحديث حالة العميل");
      }
    }
  };
  
  const handleEndCall = async (feedback?: number) => {
    if (selectedCustomer) {
      try {
        const updatedCustomer = await updateCustomerStatus(
          selectedCustomer.id, 
          'resolved',
          feedback
        );
        
        setCustomers(prev => 
          prev.map(c => c.id === selectedCustomer.id ? updatedCustomer : c)
        );
        
        toast.success("تم انهاء المكالمة وتحديث حالة العميل");
      } catch (error) {
        console.error("Failed to update customer status:", error);
        toast.error("فشل في تحديث حالة العميل");
      }
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">نظام اتصالات العملاء الآلي</h1>
        <div className="space-x-2 flex">
          <Button 
            variant="outline" 
            onClick={() => setApiKeyDialogOpen(true)}
          >
            إعدادات API
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">جاري تحميل بيانات العملاء...</p>
        </div>
      ) : selectedCustomer ? (
        <CallInterface 
          customer={selectedCustomer} 
          onEndCall={handleEndCall}
          onBack={() => setSelectedCustomer(null)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="pending">
                  <TabsList className="mb-6">
                    <TabsTrigger value="all">الكل</TabsTrigger>
                    <TabsTrigger value="pending">قيد الانتظار</TabsTrigger>
                    <TabsTrigger value="in_progress">جاري العمل</TabsTrigger>
                    <TabsTrigger value="resolved">تم الحل</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all">
                    <CustomerList 
                      customers={customers} 
                      onSelectCustomer={handleSelectCustomer} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="pending">
                    <CustomerList 
                      customers={customers.filter(c => c.status === 'pending')} 
                      onSelectCustomer={handleSelectCustomer} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="in_progress">
                    <CustomerList 
                      customers={customers.filter(c => c.status === 'in_progress')} 
                      onSelectCustomer={handleSelectCustomer} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="resolved">
                    <CustomerList 
                      customers={customers.filter(c => c.status === 'resolved')} 
                      onSelectCustomer={handleSelectCustomer} 
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">احصائيات</h2>
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="text-lg font-medium">حالات التذاكر</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span>قيد الانتظار:</span>
                        <span className="font-bold">{customers.filter(c => c.status === 'pending').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>جاري العمل:</span>
                        <span className="font-bold">{customers.filter(c => c.status === 'in_progress').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>تم الحل:</span>
                        <span className="font-bold">{customers.filter(c => c.status === 'resolved').length}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="text-lg font-medium">متوسط التقييم</h3>
                    <div className="mt-2">
                      <div className="text-3xl font-bold text-center">
                        {(() => {
                          const customersWithFeedback = customers.filter(c => c.feedback);
                          if (customersWithFeedback.length === 0) return 'لا يوجد';
                          
                          const average = customersWithFeedback.reduce((acc, curr) => 
                            acc + (curr.feedback || 0), 0) / customersWithFeedback.length;
                          
                          return average.toFixed(1) + '/5';
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="text-lg font-medium">إجمالي العملاء</h3>
                    <div className="text-3xl font-bold text-center mt-2">
                      {customers.length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      <ApiKeyDialog 
        open={apiKeyDialogOpen}
        onOpenChange={setApiKeyDialogOpen}
      />
    </div>
  );
};

export default Index;
