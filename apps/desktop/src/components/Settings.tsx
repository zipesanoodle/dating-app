import { useState, useEffect } from "react";
import { api, Profile } from "../api";
import { User, Camera, Save, LogOut } from "lucide-react";

export function Settings({ onLogout }: { onLogout: () => void }) {
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await api.getMe();
      if (data) setProfile(data);
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateProfile(profile);
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to update profile", error);
      setMessage("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8 text-gray-400">Loading...</div>;

  return (
    <div className="w-full max-w-lg mx-auto p-6 pb-24 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-xl">
            {profile.imageUrl ? (
              <img src={profile.imageUrl} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <User size={48} />
              </div>
            )}
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-pink-500 text-white rounded-full shadow-lg hover:bg-pink-600 transition-colors">
            <Camera size={18} />
          </button>
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">{profile.name || "Set your name"}</h2>
        <p className="text-gray-500">{profile.age ? `${profile.age} years old` : "Add your age"}</p>
      </div>

      <div className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Name</label>
          <input 
            type="text" 
            value={profile.name || ""} 
            onChange={e => setProfile({...profile, name: e.target.value})}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all"
            placeholder="Your name"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Age</label>
          <input 
            type="number" 
            value={profile.age || ""} 
            onChange={e => setProfile({...profile, age: parseInt(e.target.value)})}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all"
            placeholder="Your age"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Bio</label>
          <textarea 
            value={profile.bio || ""} 
            onChange={e => setProfile({...profile, bio: e.target.value})}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all h-24 resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Image URL</label>
          <input 
            type="text" 
            value={profile.imageUrl || ""} 
            onChange={e => setProfile({...profile, imageUrl: e.target.value})}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all"
            placeholder="https://images.unsplash.com/..."
          />
        </div>
        
        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold rounded-xl shadow-lg hover:shadow-pink-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {saving ? "Saving..." : <><Save size={20} /> Save Changes</>}
        </button>
        
        {message && (
          <p className={`text-center text-sm font-medium ${message.includes("success") ? "text-green-500" : "text-red-500"}`}>
            {message}
          </p>
        )}
      </div>

      <button 
        onClick={onLogout}
        className="w-full py-3 border-2 border-gray-200 text-gray-500 font-bold rounded-xl hover:border-red-200 hover:text-red-500 transition-all flex items-center justify-center gap-2"
      >
        <LogOut size={20} /> Logout
      </button>
    </div>
  );
}
