using System.Text.RegularExpressions;

public static class GrammarCheck
{
    static readonly string[] Markers =
    {
        "am", "is", "are", "was", "were", "do", "does", "did", "can", "could",
        "will", "would", "have", "has", "had", "what", "where", "who", "how",
        "why", "when", "please", "my", "your", "like", "want", "go", "see"
    };

    public static bool Accept(string text)
    {
        if (IsBlank(text)) return false;
        var trimmed = text.Trim();
        var words = Regex.Split(trimmed, @"\s+");
        if (words.Length < 2) return false;
        if (!char.IsUpper(trimmed[0])) return false;
        var last = trimmed[trimmed.Length - 1];
        if (last != '.' && last != '?' && last != '!') return false;
        var lower = trimmed.ToLower();
        for (var i = 0; i < Markers.Length; i++)
        {
            if (Regex.IsMatch(lower, @"\b" + Markers[i] + @"\b")) return true;
        }
        return false;
    }

    public static bool IsBlank(string text)
    {
        return text == null || text.Trim().Length == 0;
    }
}
