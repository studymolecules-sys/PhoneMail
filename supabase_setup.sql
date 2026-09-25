-- PhoneMail Security Setup & RLS Policies

-- 1. Enable RLS on the emails table
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

-- 2. Policy: Users can only READ emails where they are the sender OR the recipient
DROP POLICY IF EXISTS "Users can view their own emails" ON public.emails;
CREATE POLICY "Users can view their own emails" 
ON public.emails 
FOR SELECT 
USING (
  sender_address = (auth.jwt() ->> 'phone') || '@phonemail.com'
  OR 
  recipient_address = (auth.jwt() ->> 'phone') || '@phonemail.com'
);

-- 3. Policy: Users can only INSERT (send) emails if the sender_address matches their authenticated phone number
DROP POLICY IF EXISTS "Users can send emails as themselves" ON public.emails;
CREATE POLICY "Users can send emails as themselves" 
ON public.emails 
FOR INSERT 
WITH CHECK (
  sender_address = (auth.jwt() ->> 'phone') || '@phonemail.com'
);

-- 4. Policy: Allow the SMTP Server (or external senders) to insert incoming emails
DROP POLICY IF EXISTS "Allow incoming emails insert" ON public.emails;
CREATE POLICY "Allow incoming emails insert" 
ON public.emails 
FOR INSERT 
WITH CHECK (true);

-- 5. Policy: Users can UPDATE emails (e.g., marking as read) only if they are the recipient
DROP POLICY IF EXISTS "Users can update read status of received emails" ON public.emails;
CREATE POLICY "Users can update read status of received emails" 
ON public.emails 
FOR UPDATE 
USING (
  recipient_address = (auth.jwt() ->> 'phone') || '@phonemail.com'
);

-- 6. Policy: Users can DELETE their own emails
DROP POLICY IF EXISTS "Users can delete their own emails" ON public.emails;
CREATE POLICY "Users can delete their own emails" 
ON public.emails 
FOR DELETE 
USING (
  sender_address = (auth.jwt() ->> 'phone') || '@phonemail.com'
  OR 
  recipient_address = (auth.jwt() ->> 'phone') || '@phonemail.com'
);
