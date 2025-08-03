export interface FlashcardQuantityModalProps {
  topicName: string;
  totalFlashcards: number | (() => Promise<number>);
  onStartStudy: (quantity: number) => void;
  onClose: () => void;
} 