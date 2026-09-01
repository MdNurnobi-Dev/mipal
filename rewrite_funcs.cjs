const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const lines = code.split('\n');

const claimDailyRewardStart = lines.findIndex(l => l.includes('const claimDailyReward = () => {'));
let claimDailyRewardEnd = -1;
for (let i = claimDailyRewardStart + 1; i < lines.length; i++) {
  if (lines[i].includes('const updateReferralSettings = ')) {
    claimDailyRewardEnd = i - 1;
    break;
  }
}

const completeTaskStart = lines.findIndex(l => l.includes('const completeTask = (amount: number, taskName: string) => {'));
let completeTaskEnd = -1;
for (let i = completeTaskStart + 1; i < lines.length; i++) {
  if (lines[i].includes('const updateUserProfile = ')) {
    completeTaskEnd = i - 1;
    break;
  }
}

console.log(claimDailyRewardStart, claimDailyRewardEnd);
console.log(completeTaskStart, completeTaskEnd);
