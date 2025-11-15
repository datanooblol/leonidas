interface EmptyChatProps {
  chatWithData: boolean
}

export const EmptyChat = ({ chatWithData }: EmptyChatProps) => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center text-gray-500 dark:text-gray-400">
      <div className="text-4xl mb-4">🤖</div>
      <h2 className="text-xl font-medium mb-2">สวัสดี bro!</h2>
      <p>
        {chatWithData 
          ? 'เลือกเอกสารจากด้านซ้าย แล้วเริ่มถามคำถามได้เลย' 
          : 'เปิด "Chat with Data" เพื่อวิเคราะห์ข้อมูลของคุณ'
        }
      </p>
    </div>
  </div>
)