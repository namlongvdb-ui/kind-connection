import UNCForm from '@/components/UNCForm';
import UNCPreview from '@/components/UNCPreview';
import { useUNCForm, UNCFormData } from '@/hooks/useUNCForm';
import { useBeneficiaries } from '@/hooks/useBeneficiaries';
import { useTransactionHistory, TransactionRecord } from '@/hooks/useTransactionHistory';

const Index = () => {
  const { formData, updateField, setFormData } = useUNCForm();
  const { beneficiaries, addBeneficiary, removeBeneficiary } = useBeneficiaries();
  const { history, saveTransaction, removeTransaction } = useTransactionHistory();

  const handleSaveTransaction = () => saveTransaction(formData);

  const handleLoadTransaction = (record: TransactionRecord) => {
    setFormData(record.formData);
  };

  return (
    <div className="flex h-svh overflow-hidden bg-desk">
      <UNCForm
        formData={formData}
        updateField={updateField}
        beneficiaries={beneficiaries}
        onSaveBeneficiary={addBeneficiary}
        onRemoveBeneficiary={removeBeneficiary}
        history={history}
        onSaveTransaction={handleSaveTransaction}
        onLoadTransaction={handleLoadTransaction}
        onRemoveTransaction={removeTransaction}
      />
      <UNCPreview formData={formData} />
    </div>
  );
};

export default Index;
