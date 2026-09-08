import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { registerCompany } from "../../api/company";

export default function CompanyRegisterPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        company_name: "",
        email: "",
        password: "",
        website: "",
        industry: "",
        country: "",
        phone: "",
    });

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {

            await registerCompany(form);

            navigate("/company/login");

        } catch (err: any) {

            setError("Unable to register company.");

        } finally {

            setLoading(false);

        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">

            <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-lg">

                <h1 className="text-3xl font-bold text-center mb-8">

                    Company Registration

                </h1>

                {error && (
                    <div className="bg-red-100 text-red-600 p-3 rounded mb-5">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >

                    <input
                        className="w-full border rounded-lg p-3"
                        placeholder="Company Name"
                        value={form.company_name}
                        onChange={(e)=>setForm({...form,company_name:e.target.value})}
                    />

                    <input
                        className="w-full border rounded-lg p-3"
                        placeholder="Company Email"
                        value={form.email}
                        onChange={(e)=>setForm({...form,email:e.target.value})}
                    />

                    <input
                        type="password"
                        className="w-full border rounded-lg p-3"
                        placeholder="Password"
                        value={form.password}
                        onChange={(e)=>setForm({...form,password:e.target.value})}
                    />

                    <input
                        className="w-full border rounded-lg p-3"
                        placeholder="Website"
                        value={form.website}
                        onChange={(e)=>setForm({...form,website:e.target.value})}
                    />

                    <input
                        className="w-full border rounded-lg p-3"
                        placeholder="Industry"
                        value={form.industry}
                        onChange={(e)=>setForm({...form,industry:e.target.value})}
                    />

                    <input
                        className="w-full border rounded-lg p-3"
                        placeholder="Country"
                        value={form.country}
                        onChange={(e)=>setForm({...form,country:e.target.value})}
                    />

                    <input
                        className="w-full border rounded-lg p-3"
                        placeholder="Phone"
                        value={form.phone}
                        onChange={(e)=>setForm({...form,phone:e.target.value})}
                    />

                    <button
                        className="w-full bg-green-600 text-white p-3 rounded-lg"
                    >
                        {loading ? "Registering..." : "Register Company"}
                    </button>

                </form>

                <div className="mt-6 text-center">

                    Already have an account?

                    <Link
                        to="/company/login"
                        className="text-blue-600 ml-2"
                    >
                        Login
                    </Link>

                </div>

            </div>

        </div>
    );
}