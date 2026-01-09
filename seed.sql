-- Seed Data for NuClear Supply Chain App

-- 1. Shipments
INSERT INTO public.shipments (isotope, origin, destination, status, eta, status_color) VALUES 
('Tc-99m', 'Oak Ridge, TN', 'Memorial Hospital, NYC', 'In Transit', NOW() + INTERVAL '2 days', 'bg-blue-100 text-blue-800'),
('I-131', 'Chalk River, ON', 'Johns Hopkins, MD', 'At Customs', NOW() + INTERVAL '3 days', 'bg-yellow-100 text-yellow-800'),
('Mo-99', 'ANSTO, Australia', 'Mayo Clinic, MN', 'Dispatched', NOW() + INTERVAL '5 days', 'bg-purple-100 text-purple-800'),
('F-18', 'Nordion, Canada', 'Cleveland Clinic, OH', 'Delivered', NOW() - INTERVAL '1 day', 'bg-green-100 text-green-800'),
('Ga-68', 'IRE, Belgium', 'Stanford Medical, CA', 'Pending', NOW() + INTERVAL '7 days', 'bg-gray-100 text-gray-800');

-- 2. Compliance Alerts
INSERT INTO public.compliance_alerts (severity, title, description) VALUES 
('warning', 'License Renewal', 'License renewal due in 30 days'),
('info', 'Quality Check', 'Routine quality inspection scheduled for next week');
-- Add a critical one if needed
-- ('error', 'Customs Hold', 'Shipment SHP-999 held at customs for documentation');

-- 3. Activities
INSERT INTO public.activities (event, type, time) VALUES 
('Shipment cleared customs in Newark', 'customs', NOW() - INTERVAL '2 hours'),
('New procurement request submitted for Tc-99m', 'procurement', NOW() - INTERVAL '4 hours'),
('Delivery confirmed at Memorial Hospital', 'delivery', NOW() - INTERVAL '1 day'),
('Compliance alert: License renewal due', 'alert', NOW() - INTERVAL '2 days'),
('Quality inspection approved for batch B-2024-001', 'approval', NOW() - INTERVAL '3 days');

-- 4. Deliveries (Upcoming and some completed for testing)
-- NOTE: These seed times are relative to when the script is run.
-- Past deliveries (for testing "completed" status - will show in recent activity if run after these times)
INSERT INTO public.deliveries (date, time, isotope, destination) VALUES 
(CURRENT_DATE, '06:00', 'F-18', 'City General Hospital, LA'),
(CURRENT_DATE, '07:30', 'Lu-177', 'Mount Sinai Hospital, NY'),
-- Upcoming today (set for later in the day - adjust times as needed for your timezone)
(CURRENT_DATE, '18:00', 'Tc-99m', 'Memorial Hospital, NYC'),
(CURRENT_DATE, '20:30', 'Ga-68', 'UCLA Medical Center, CA'),
-- Tomorrow
(CURRENT_DATE + 1, '09:00', 'I-131', 'Johns Hopkins, MD'),
(CURRENT_DATE + 1, '14:30', 'Mo-99', 'Massachusetts General, MA'),
(CURRENT_DATE + 1, '16:45', 'Y-90', 'Cleveland Clinic, OH'),
-- Day after tomorrow
(CURRENT_DATE + 2, '08:30', 'Lu-177', 'Houston Methodist, TX'),
(CURRENT_DATE + 2, '10:15', 'Tc-99m', 'Mayo Clinic, MN'),
(CURRENT_DATE + 2, '15:00', 'F-18', 'Stanford Medical, CA'),
-- Third day ahead
(CURRENT_DATE + 3, '11:00', 'Ga-68', 'Northwestern Memorial, IL'),
(CURRENT_DATE + 3, '13:30', 'I-131', 'Barnes-Jewish, MO');

-- 5. Permits (Sample)
INSERT INTO public.permits (name, expiry_date, status) VALUES 
('Import License US-2024', NOW() + INTERVAL '30 days', 'expiring'),
('Transport Permit CA-99', NOW() + INTERVAL '180 days', 'valid'),
('Handling Cert H-55', NOW() - INTERVAL '5 days', 'expired');
