const fs = require('fs');

const path = 'c:/Users/Welcome/Desktop/vacancyamerica/frontend/src/pages/LandingPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Rewrite Hero Text
const oldHeroText = `<p className="landing-hero-animate-delay text-sm text-[#94A3B8] max-w-xl mx-auto mb-10">
                        Companies: we verify your listing and connect you with quality applicants — completely free.
                    </p>`;
const newHeroText = `<div className="landing-hero-animate-delay bg-white/60 backdrop-blur-md rounded-2xl border border-[#E5E7EB] shadow-sm max-w-2xl mx-auto mb-10 p-5 text-left flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 text-[#E63946] flex items-center justify-center shrink-0 mt-1">
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[#102A43] font-bold text-base block mb-1">For Companies & Employers</span>
                            <p className="text-sm text-[#64748B] leading-relaxed">
                                VacancyAmerica helps you get the right people for your team. Find ready-to-work Americans across all 50 states without paying thousands in posting fees.
                            </p>
                        </div>
                    </div>`;

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
