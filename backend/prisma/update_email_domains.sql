-- Update companies table email domains to safe example domains
UPDATE companies SET 
  email_domain = CASE 
    WHEN email_domain LIKE '%.co.jp' OR email_domain LIKE '%.jp' THEN REPLACE(REPLACE(email_domain, '.co.jp', '.example.com'), '.jp', '.example.com')
    WHEN email_domain LIKE '%.com' AND email_domain NOT LIKE '%.example.com' THEN REPLACE(email_domain, '.com', '.example.com')
    ELSE email_domain
  END,
  website_url = CASE 
    WHEN website_url IS NOT NULL THEN 
      REPLACE(REPLACE(REPLACE(website_url, '.co.jp', '.example.com'), '.jp', '.example.com'), 
        CASE WHEN website_url LIKE '%.com' AND website_url NOT LIKE '%.example.com' THEN '.com' ELSE '' END, 
        CASE WHEN website_url LIKE '%.com' AND website_url NOT LIKE '%.example.com' THEN '.example.com' ELSE '' END)
    ELSE website_url
  END,
  contact_email = CASE 
    WHEN contact_email LIKE '%@%.co.jp' OR contact_email LIKE '%@%.jp' THEN 
      REPLACE(REPLACE(contact_email, '.co.jp', '.example.com'), '.jp', '.example.com')
    WHEN contact_email LIKE '%@%.com' AND contact_email NOT LIKE '%@%.example.com' THEN 
      REPLACE(contact_email, '.com', '.example.com')
    ELSE contact_email
  END
WHERE email_domain NOT LIKE '%.example.%' 
   OR website_url NOT LIKE '%.example.%' 
   OR contact_email NOT LIKE '%@%.example.%';

-- Update users table emails
UPDATE users SET 
  email = CASE 
    WHEN email LIKE '%@%.co.jp' OR email LIKE '%@%.jp' THEN 
      REPLACE(REPLACE(email, '.co.jp', '.example.com'), '.jp', '.example.com')
    WHEN email LIKE '%@%.com' AND email NOT LIKE '%@%.example.com' THEN 
      REPLACE(email, '.com', '.example.com')
    ELSE email
  END,
  personal_email = CASE 
    WHEN personal_email IS NOT NULL AND (personal_email LIKE '%@%.co.jp' OR personal_email LIKE '%@%.jp') THEN 
      REPLACE(REPLACE(personal_email, '.co.jp', '.example.com'), '.jp', '.example.com')
    WHEN personal_email IS NOT NULL AND personal_email LIKE '%@%.com' AND personal_email NOT LIKE '%@%.example.com' THEN 
      REPLACE(personal_email, '.com', '.example.com')
    ELSE personal_email
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
  sender_email = CASE 
    WHEN sender_email IS NOT NULL AND (sender_email LIKE '%@%.co.jp' OR sender_email LIKE '%@%.jp') THEN 
      REPLACE(REPLACE(sender_email, '.co.jp', '.example.com'), '.jp', '.example.com')
    WHEN sender_email IS NOT NULL AND sender_email LIKE '%@%.com' AND sender_email NOT LIKE '%@%.example.com' THEN 
      REPLACE(sender_email, '.com', '.example.com')
    ELSE sender_email
  END
WHERE sender_email IS NOT NULL AND sender_email NOT LIKE '%@%.example.%';

-- Update email_logs table
UPDATE email_logs SET 
  from_email = CASE 
    WHEN from_email LIKE '%@%.co.jp' OR from_email LIKE '%@%.jp' THEN 
      REPLACE(REPLACE(from_email, '.co.jp', '.example.com'), '.jp', '.example.com')
    WHEN from_email LIKE '%@%.com' AND from_email NOT LIKE '%@%.example.com' THEN 
      REPLACE(from_email, '.com', '.example.com')
    ELSE from_email
  END,
  to_email = CASE 
    WHEN to_email LIKE '%@%.co.jp' OR to_email LIKE '%@%.jp' THEN 
      REPLACE(REPLACE(to_email, '.co.jp', '.example.com'), '.jp', '.example.com')
    WHEN to_email LIKE '%@%.com' AND to_email NOT LIKE '%@%.example.com' THEN 
      REPLACE(to_email, '.com', '.example.com')
    ELSE to_email
  END
WHERE from_email NOT LIKE '%@%.example.%' OR to_email NOT LIKE '%@%.example.%';

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
SELECT 'Companies updated' as table_name, COUNT(*) as count FROM companies WHERE email_domain LIKE '%.example.%'
UNION ALL
SELECT 'Users updated', COUNT(*) FROM users WHERE email LIKE '%@%.example.%'
UNION ALL
SELECT 'Engineers updated', COUNT(*) FROM engineers WHERE email LIKE '%@%.example.%'
UNION ALL
SELECT 'Client users updated', COUNT(*) FROM client_users WHERE email LIKE '%@%.example.%'
UNION ALL
SELECT 'Admin users updated', COUNT(*) FROM admin_users WHERE email LIKE '%@%.example.%';