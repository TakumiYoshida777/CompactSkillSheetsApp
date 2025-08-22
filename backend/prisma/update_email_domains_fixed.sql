-- Update companies table email domains to safe example domains
UPDATE companies SET 
  "emailDomain" = CASE 
    WHEN "emailDomain" LIKE '%.co.jp' OR "emailDomain" LIKE '%.jp' THEN REPLACE(REPLACE("emailDomain", '.co.jp', '.example.com'), '.jp', '.example.com')
    WHEN "emailDomain" LIKE '%.com' AND "emailDomain" NOT LIKE '%.example.com' THEN REPLACE("emailDomain", '.com', '.example.com')
    ELSE "emailDomain"
  END,
  "websiteUrl" = CASE 
    WHEN "websiteUrl" IS NOT NULL THEN 
      REPLACE(REPLACE(REPLACE("websiteUrl", '.co.jp', '.example.com'), '.jp', '.example.com'), 
        CASE WHEN "websiteUrl" LIKE '%.com' AND "websiteUrl" NOT LIKE '%.example.com' THEN '.com' ELSE '' END, 
        CASE WHEN "websiteUrl" LIKE '%.com' AND "websiteUrl" NOT LIKE '%.example.com' THEN '.example.com' ELSE '' END)
    ELSE "websiteUrl"
  END,
  "contactEmail" = CASE 
    WHEN "contactEmail" LIKE '%@%.co.jp' OR "contactEmail" LIKE '%@%.jp' THEN 
      REPLACE(REPLACE("contactEmail", '.co.jp', '.example.com'), '.jp', '.example.com')
    WHEN "contactEmail" LIKE '%@%.com' AND "contactEmail" NOT LIKE '%@%.example.com' THEN 
      REPLACE("contactEmail", '.com', '.example.com')
    ELSE "contactEmail"
  END
WHERE "emailDomain" NOT LIKE '%.example.%' 
   OR "websiteUrl" NOT LIKE '%.example.%' 
   OR "contactEmail" NOT LIKE '%@%.example.%';

-- Update users table emails
UPDATE users SET 
  email = CASE 
    WHEN email LIKE '%@%.co.jp' OR email LIKE '%@%.jp' THEN 
      REPLACE(REPLACE(email, '.co.jp', '.example.com'), '.jp', '.example.com')
    WHEN email LIKE '%@%.com' AND email NOT LIKE '%@%.example.com' THEN 
      REPLACE(email, '.com', '.example.com')
    ELSE email
  END,
  "personalEmail" = CASE 
    WHEN "personalEmail" IS NOT NULL AND ("personalEmail" LIKE '%@%.co.jp' OR "personalEmail" LIKE '%@%.jp') THEN 
      REPLACE(REPLACE("personalEmail", '.co.jp', '.example.com'), '.jp', '.example.com')
    WHEN "personalEmail" IS NOT NULL AND "personalEmail" LIKE '%@%.com' AND "personalEmail" NOT LIKE '%@%.example.com' THEN 
      REPLACE("personalEmail", '.com', '.example.com')
    ELSE "personalEmail"
  END
WHERE email NOT LIKE '%@%.example.%';

-- Update engineers table emails
UPDATE engineers SET 
  email = CASE 
    WHEN email LIKE '%@%.co.jp' OR email LIKE '%@%.jp' THEN 
      REPLACE(REPLACE(email, '.co.jp', '.example.com'), '.jp', '.example.com')
    WHEN email LIKE '%@%.com' AND email NOT LIKE '%@%.example.com' THEN 
      REPLACE(email, '.com', '.example.com')
    ELSE email
  END
WHERE email NOT LIKE '%@%.example.%';

-- Update client_users table emails
UPDATE client_users SET 
  email = CASE 
    WHEN email LIKE '%@%.co.jp' OR email LIKE '%@%.jp' THEN 
      REPLACE(REPLACE(email, '.co.jp', '.example.com'), '.jp', '.example.com')
    WHEN email LIKE '%@%.com' AND email NOT LIKE '%@%.example.com' THEN 
      REPLACE(email, '.com', '.example.com')
    ELSE email
  END
WHERE email NOT LIKE '%@%.example.%';

-- Update email_templates table
UPDATE email_templates SET 
  "senderEmail" = CASE 
    WHEN "senderEmail" IS NOT NULL AND ("senderEmail" LIKE '%@%.co.jp' OR "senderEmail" LIKE '%@%.jp') THEN 
      REPLACE(REPLACE("senderEmail", '.co.jp', '.example.com'), '.jp', '.example.com')
    WHEN "senderEmail" IS NOT NULL AND "senderEmail" LIKE '%@%.com' AND "senderEmail" NOT LIKE '%@%.example.com' THEN 
      REPLACE("senderEmail", '.com', '.example.com')
    ELSE "senderEmail"
  END
WHERE "senderEmail" IS NOT NULL AND "senderEmail" NOT LIKE '%@%.example.%';

-- Update email_logs table
UPDATE email_logs SET 
  "fromEmail" = CASE 
    WHEN "fromEmail" LIKE '%@%.co.jp' OR "fromEmail" LIKE '%@%.jp' THEN 
      REPLACE(REPLACE("fromEmail", '.co.jp', '.example.com'), '.jp', '.example.com')
    WHEN "fromEmail" LIKE '%@%.com' AND "fromEmail" NOT LIKE '%@%.example.com' THEN 
      REPLACE("fromEmail", '.com', '.example.com')
    ELSE "fromEmail"
  END,
  "toEmail" = CASE 
    WHEN "toEmail" LIKE '%@%.co.jp' OR "toEmail" LIKE '%@%.jp' THEN 
      REPLACE(REPLACE("toEmail", '.co.jp', '.example.com'), '.jp', '.example.com')
    WHEN "toEmail" LIKE '%@%.com' AND "toEmail" NOT LIKE '%@%.example.com' THEN 
      REPLACE("toEmail", '.com', '.example.com')
    ELSE "toEmail"
  END
WHERE "fromEmail" NOT LIKE '%@%.example.%' OR "toEmail" NOT LIKE '%@%.example.%';

-- Update admin_users table emails  
UPDATE admin_users SET 
  email = CASE 
    WHEN email LIKE '%@%.co.jp' OR email LIKE '%@%.jp' THEN 
      REPLACE(REPLACE(email, '.co.jp', '.example.com'), '.jp', '.example.com')
    WHEN email LIKE '%@%.com' AND email NOT LIKE '%@%.example.com' THEN 
      REPLACE(email, '.com', '.example.com')
    ELSE email
  END
WHERE email NOT LIKE '%@%.example.%';

-- Show summary of updates
SELECT 'Companies updated' as table_name, COUNT(*) as count FROM companies WHERE "emailDomain" LIKE '%.example.%'
UNION ALL
SELECT 'Users updated', COUNT(*) FROM users WHERE email LIKE '%@%.example.%'
UNION ALL
SELECT 'Engineers updated', COUNT(*) FROM engineers WHERE email LIKE '%@%.example.%'
UNION ALL
SELECT 'Client users updated', COUNT(*) FROM client_users WHERE email LIKE '%@%.example.%'
UNION ALL
SELECT 'Admin users updated', COUNT(*) FROM admin_users WHERE email LIKE '%@%.example.%';