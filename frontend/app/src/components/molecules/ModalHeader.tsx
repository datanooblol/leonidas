import { Button } from "../atoms/Button";
import { CloseButton } from "../atoms/CloseButton";
import { Heading } from "../atoms/Heading";

interface ModalHeaderProps {
  title: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onClose: () => void;
}

export const ModalHeader = ({
  title,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onClose,
}: ModalHeaderProps) => (
  <div className="flex justify-between items-center mb-4">
    <Heading>{title}</Heading>
    <div className="flex space-x-2">
      {!isEditing ? (
        <Button
          onClick={onEdit}
          className="px-3 py-1 text-sm w-auto bg-blue-500 hover:bg-blue-600"
        >
          แก้ไข
        </Button>
      ) : (
        <>
          <Button
            onClick={onSave}
            className="px-3 py-1 text-sm w-auto bg-green-500 hover:bg-green-600"
          >
            บันทึก
          </Button>
          <Button
            onClick={onCancel}
            variant="secondary"
            className="px-3 py-1 text-sm w-auto"
          >
            ยกเลิก
          </Button>
        </>
      )}
      <CloseButton onClick={onClose} />
    </div>
  </div>
);
