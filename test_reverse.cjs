const fs = require('fs');

function uncorrupt(code, searchPattern, replacePrefix, replaceSuffix) {
    // If the file wasn't corrupted by this, return
    if (!code.includes(replacePrefix)) return code;
    
    // We know the regex was replaced globally. 
    // The first replacement is at code.indexOf(replacePrefix).
    let firstIdx = code.indexOf(replacePrefix);
    
    // The text before the first match is A
    let A = code.substring(0, firstIdx);
    
    // The text after replacePrefix is the rest of the original string (B_rest)
    // How do we find the end of B_rest? 
    // We know that B_rest was followed by replaceSuffix.
    // And after that, the REST of the corrupted string continues.
    // Since B_rest is EXACTLY the rest of the original string, it means A + searchPattern + B_rest IS the original string!
    // We just need to find the correct replaceSuffix that marks the end of B_rest.
    // Wait, B_rest is the REST of the original string. It has NO further modifications from THIS rule!
    // So B_rest contains the original searchPattern instead of replacePrefix!
    
    // Wait, is it really that simple? 
    // YES! The first replacement inserted EXACTLY the rest of the original string as it was BEFORE the global regex ran!
    // So the original string is simply: A + searchPattern + (the string immediately following replacePrefix, up to its natural end)
    // But how long is B_rest? 
    // If we just take the rest of the string, it includes the trailing `replaceSuffix` and the rest of the corrupted string.
    // To find the exact length of B_rest, we can use the fact that original string = A + searchPattern + B_rest.
    // Since the original string was processed by `replace` to produce `code`, we can just guess the length of B_rest!
    // Let L_B be the length of B_rest.
    // We know that `code` is formed by running the replace on `A + searchPattern + B_rest`.
    // So if we try all possible lengths for B_rest, one of them, when run through the `replace` function, will EXACTLY equal `code`!
    
    for (let i = 0; i < code.length - firstIdx; i++) {
        let candidate_B_rest = code.substring(firstIdx + replacePrefix.length, firstIdx + replacePrefix.length + i);
        let candidate_original = A + searchPattern + candidate_B_rest;
        
        // Mock the replacement that caused the corruption
        // But wait, the replacement used was: code.replace(regex, replacePrefix + "$'" + replaceSuffix)
        // Which is exactly what String.prototype.replace does with '$'.
        // Let's build the corrupted version of candidate_original to see if it matches `code`.
        
        let regex;
        if (searchPattern === ">\\$\\{") regex = />\$\{/g;
        else if (searchPattern === "\\$\\$\\{") regex = /\$\$\{/g;
        else if (searchPattern === ">\\$([0-9]+\\.[0-9]+)<") regex = />\$([0-9]+\.[0-9]+)</g;
        else if (searchPattern === "\\$([0-9]+\\.[0-9]{2})") regex = /\$([0-9]+\.[0-9]{2})/g;
        
        // We need to exactly match the replacement string used
        let replacementStr;
        if (replacePrefix === ">{siteSettings?.currency || '") {
            replacementStr = ">{siteSettings?.currency || '$'}{";
        } else if (replacePrefix === "{siteSettings?.currency || '") {
             if (searchPattern.includes("([0-9]")) {
                 replacementStr = "{siteSettings?.currency || '$'}$1";
             } else {
                 replacementStr = "${siteSettings?.currency || '$'}${";
             }
        }
        
        let corrupted_candidate = candidate_original.replace(regex, replacementStr);
        if (corrupted_candidate === code) {
            return candidate_original;
        }
    }
    
    return null; // Failed to uncorrupt
}

let c = fs.readFileSync('src/pages/Earnings.tsx', 'utf8');
let orig = uncorrupt(c, ">\\$\\{", ">{siteSettings?.currency || '", "}{");
if (orig) {
    console.log("Successfully recovered Earnings.tsx! Original length: " + orig.length);
    fs.writeFileSync('src/pages/Earnings.tsx', orig);
} else {
    console.log("Failed to recover.");
}
