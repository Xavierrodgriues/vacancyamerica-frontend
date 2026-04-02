import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Loader2, Paperclip, Send } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { useSubmitInterestedApplication } from "@/hooks/use-posts";

interface InterestedApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILE_COUNT = 5;
const ACCEPTED_FILE_TYPES = ".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp";

export function InterestedApplicationDialog({
  open,
  onOpenChange,
  postId,
}: InterestedApplicationDialogProps) {
  const { user } = useAuth();
  const submitInterestedApplication = useSubmitInterestedApplication();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [documents, setDocuments] = useState<File[]>([]);

  useEffect(() => {
    if (open) {
      setFullName(user?.display_name || "");
      setEmail(user?.email || "");
    }
  }, [open, user?.display_name, user?.email]);

  const totalDocumentSize = useMemo(
    () => documents.reduce((sum, file) => sum + file.size, 0),
    [documents]
  );

  const resetForm = () => {
    setPhone("");
    setLocation("");
    setCoverLetter("");
    setDocuments([]);
    setFullName(user?.display_name || "");
    setEmail(user?.email || "");
  };

  const handleDocumentsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length > MAX_FILE_COUNT) {
      toast.error(`You can upload up to ${MAX_FILE_COUNT} documents`);
      event.target.value = "";
      return;
    }

    const oversized = selectedFiles.find((file) => file.size > MAX_FILE_SIZE);
    if (oversized) {
      toast.error(`${oversized.name} is larger than 10 MB`);
      event.target.value = "";
      return;
    }

    setDocuments(selectedFiles);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      toast.error("Full name, email, and phone are required");
      return;
    }

    if (documents.length === 0) {
      toast.error("Please upload at least one document");
      return;
    }

    try {
      await submitInterestedApplication.mutateAsync({
        postId,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        location: location.trim(),
        coverLetter: coverLetter.trim(),
        documents,
      });

      toast.success("Interest submitted successfully");
      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit interest");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!submitInterestedApplication.isPending && !nextOpen) {
          resetForm();
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-2xl max-h-[90vh] rounded-2xl border-slate-200 p-0 overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-sky-50 via-white to-emerald-50 px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 shrink-0">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl text-slate-900">Apply as Interested</DialogTitle>
            <DialogDescription className="text-slate-600">
              Share your contact details and upload your documents. Files will be compressed before storage.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="interested-full-name">Full name</Label>
              <Input
                id="interested-full-name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Your full name"
                disabled={submitInterestedApplication.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interested-email">Email</Label>
              <Input
                id="interested-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                disabled={submitInterestedApplication.isPending}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="interested-phone">Phone</Label>
              <Input
                id="interested-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+1 555 123 4567"
                disabled={submitInterestedApplication.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interested-location">Location</Label>
              <Input
                id="interested-location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="City, State"
                disabled={submitInterestedApplication.isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interested-cover-letter">About you</Label>
            <Textarea
              id="interested-cover-letter"
              value={coverLetter}
              onChange={(event) => setCoverLetter(event.target.value)}
              placeholder="Tell the employer why you're interested"
              className="min-h-[120px]"
              disabled={submitInterestedApplication.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interested-documents">Documents</Label>
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-4">
              <Input
                id="interested-documents"
                type="file"
                accept={ACCEPTED_FILE_TYPES}
                multiple
                onChange={handleDocumentsChange}
                disabled={submitInterestedApplication.isPending}
                className="cursor-pointer bg-white text-sm file:mr-3 file:max-w-full file:truncate"
              />
              <p className="mt-2 text-xs text-slate-500">
                Upload up to {MAX_FILE_COUNT} files. Allowed: PDF, DOC, DOCX, JPG, PNG, WEBP. Max 10 MB each.
              </p>

              {documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  {documents.map((file) => (
                    <div
                      key={`${file.name}-${file.lastModified}`}
                      className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm border border-slate-200"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Paperclip className="h-4 w-4 text-slate-500" />
                        <span className="truncate text-slate-700">{file.name}</span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                  <p className="text-xs text-slate-500">
                    Total selected size: {(totalDocumentSize / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-3 pt-2 sticky bottom-0 bg-white">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitInterestedApplication.isPending}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitInterestedApplication.isPending}
              className="rounded-full bg-emerald-600 hover:bg-emerald-700"
            >
              {submitInterestedApplication.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Interest
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
