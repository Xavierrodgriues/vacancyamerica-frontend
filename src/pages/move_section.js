const fs = require('fs');

const path = 'c:/Users/Welcome/Desktop/vacancyamerica/frontend/src/pages/LandingPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Rewrite Hero Text
const oldHeroText = `<p className="landing-hero-animate-delay text-sm text-[#94A3B8] max-w-xl mx-auto mb-10">
                        Companies: we verify your listing and connect you with quality applicants — completely free.
                    </p>`;
const newHeroText = `<p className="landing-hero-animate-delay text-base sm:text-lg font-medium text-[#102A43] max-w-2xl mx-auto mb-10 bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-[#E5E7EB] shadow-sm">
                        <strong className="text-[#E63946]">For Companies & Recruiters:</strong> VacancyAmerica will help you find the right people for your team. We give you direct access to a nationwide pool of ready-to-work professionals.
                    </p>`;

content = content.replace(oldHeroText, newHeroText);

// 2. Extract and move the "For Companies" section
const startMarker = '            {/* ─── FOR COMPANIES ─── */}';
const targetStart = content.indexOf(startMarker);

// Find the end of the section
const sectionEndRegex = /<\/section>\r?\n/g;
sectionEndRegex.lastIndex = targetStart;
const endMatch = sectionEndRegex.exec(content);
const targetEnd = endMatch.index + endMatch[0].length;

const companiesSection = content.substring(targetStart, targetEnd);

// Remove the section from its original location
content = content.substring(0, targetStart) + content.substring(targetEnd);

// Insert it right before the JOB CATEGORIES CAROUSEL
const insertMarker = '            {/* ─── JOB CATEGORIES CAROUSEL ─── */}';
const insertIndex = content.indexOf(insertMarker);

content = content.substring(0, insertIndex) + companiesSection + '\n' + content.substring(insertIndex);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully moved For Companies section and updated hero text.');
