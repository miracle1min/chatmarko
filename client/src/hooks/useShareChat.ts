
import { toast } from './use-toast';

export const useShareChat = () => {
  const shareChat = async (chatId: number) => {
    try {
      const shareData = {
        title: 'Shared Chat',
        text: 'Check out this interesting conversation!',
        url: `${window.location.origin}/chat/${chatId}`
      };

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: "Link disalin!",
          description: "Link chat telah disalin ke clipboard"
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Gagal membagikan",
        description: "Terjadi kesalahan saat membagikan chat",
        variant: "destructive"
      });
    }
  };

  return { shareChat };
};
