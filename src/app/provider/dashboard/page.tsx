"use client";

import { Badge } from '@/components/ui/badge';
import { Check, CheckCircle, ClipboardList, Loader2, Mail, MapPin, Phone, Settings, User, XCircle } from "lucide-react";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { useProviderSocket } from "@/app/hooks/useProviderSocket";
import { useLocationTracking } from "@/app/hooks/useLocationTracking";
import { useState } from 'react';
import ProviderNavbar from '@/app/components/navbar/ProviderNavbar';
import { useAuthContext } from '@/contexts/auth-context';
import OTPVerificationModal from '@/app/components/modal/OtpVerification';

const Page = () => {
    const { loading, providerId } = useAuthContext();

    const [activeTab, setActiveTab] = useState('requests');
    const {
        accepted,
        activeRequest,
        timer,
        handleAccept,
        handleReject,
        handleVerifyOTP
    } = useProviderSocket(providerId);
    const {
        isTracking,
        handleStatusChange
    } = useLocationTracking(providerId);
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [verificationPurpose, setVerificationPurpose] = useState<'start' | 'complete'>('start');

    const handleInitiateVerification = () => {
        setVerificationPurpose('start');
        setIsOtpModalOpen(true);
    };

    const handleCompleteService = () => {
        setVerificationPurpose('complete');
        setIsOtpModalOpen(true);
    };

    console.log({ activeRequest });

    const menuItems = [
        { icon: ClipboardList, label: 'Requests', id: 'requests' },
        { icon: Settings, label: 'Services', id: 'services' },
    ];

    const [currentPage, setCurrentPage] = useState(1);

    if (loading) {
        return (
            <div className="min-h-screen bg-white relative">
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                </div>
            </div>
        );
    }
    const dummyData = Array(15).fill(0).map((_, index) => ({
        id: index + 1,
        date: 'Dec 29, 2024 14:30',
        name: 'John Doe',
        distance: '5.0 km',
        status: 'Pending'
    }));

    const itemsPerPage = activeRequest ? 3 : 5;
    const totalPages = Math.ceil(dummyData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = dummyData.slice(startIndex, startIndex + itemsPerPage);

    console.log(activeRequest?.phoneNo === '');
    console.log(activeRequest?.phoneNo);

    return (

        <div className="min-h-screen flex flex-col">
            <ProviderNavbar
                isTracking={isTracking}
                handleStatusChange={handleStatusChange}
            />
            {/* Main Content */}
            <div className="flex flex-col lg:flex-row flex-1">
                {/* Left Menu */}
                <div className="w-full lg:w-64 bg-gray-50 lg:overflow-visible">
                    <nav className="flex lg:flex-col overflow-x-auto lg:overflow-x-hidden">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${activeTab === item.id
                                    ? 'bg-gray-200'
                                    : 'hover:bg-gray-100'
                                    }`}
                            >
                                <item.icon className="h-5 w-5" />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Right Content */}
                <div className="flex-1 p-3">
                    {/* New Request Notification */}
                    {activeRequest && (
                        <Card className="mb-3">
                            <CardContent className="p-2">
                                <div className="flex flex-col space-y-2">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-xl font-semibold">New Request</h2>
                                        {/* <Badge variant="secondary" className="text-sm"> */}
                                        {/* {timer}s remaining */}
                                        {!accepted && (
                                            <Badge
                                                variant="secondary"
                                                className={timer <= 3 ? 'bg-red-100 text-red-800' : ''}
                                            >
                                                {timer}s remaining
                                            </Badge>
                                        )}
                                        {/* </Badge> */}
                                    </div>
                                    {accepted && (
                                        <div className="flex items-center space-x-3">
                                            <User className="h-5 w-5 text-gray-500" />
                                            <div>
                                                <span className="text-sm font-medium">
                                                    {activeRequest?.firstName} {activeRequest?.lastName}
                                                </span>
                                                <div className="mt-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {activeRequest?.phoneNo ? (
                                                            <>
                                                                <Phone className="h-3 w-3 mr-1" />
                                                                {activeRequest.phoneNo}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Mail className="h-3 w-3 mr-1" />
                                                                {activeRequest.email}
                                                            </>
                                                        )}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>)}
                                    <div className="flex items-center text-gray-600">
                                        <MapPin className="h-5 w-5 mr-2" />
                                        <span>{(parseInt(activeRequest.distance) / 1000).toFixed(1)} km from your location</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                                        {accepted ? (
                                            <>
                                                <Button
                                                    className="w-full sm:flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                                                >
                                                    <Phone className="mr-2 h-4 w-4" />
                                                    Call User
                                                </Button>
                                                <Button
                                                    className="bg-slate-100 hover:bg-slate-200 w-full sm:flex-1"
                                                    variant="outline"
                                                >
                                                    <MapPin className="mr-2 h-4 w-4" />
                                                    View Location
                                                </Button>

                                                <Button
                                                    className="w-full sm:flex-1 bg-[#388E3C] hover:bg-[#2E7D32] text-white"
                                                    onClick={handleInitiateVerification}
                                                >
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    Start Service
                                                </Button>
                                                <Button
                                                    className="w-full sm:flex-1 bg-purple-500 hover:bg-purple-600 text-white"
                                                    onClick={handleCompleteService}
                                                >
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Complete Service
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    className="w-full sm:flex-1 bg-green-600 hover:bg-green-700"
                                                    onClick={handleAccept}
                                                    disabled={timer === 0}
                                                >
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    Accept Request
                                                </Button>
                                                <Button
                                                    className="w-full sm:flex-1 bg-red-500 hover:bg-red-600"
                                                    onClick={handleReject}
                                                    disabled={timer === 0}
                                                >
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                    Reject Request
                                                </Button>
                                            </>
                                            // </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Requests Table */}
                    <Card>
                        <CardContent className="p-3">
                            <h2 className="text-xl font-semibold mb-3">Requests</h2>
                            <div className='overflow-x-auto lg:overflow-visible'>
                                <table className="w-full mb-auto lg:w-full min-w-[800px] lg:min-w-0">
                                    <thead>
                                        <tr className="text-left text-gray-500">
                                            <th className="px-8 pb-2">Request Date</th>
                                            <th className="px-8 pb-2">Requester Name</th>
                                            <th className="px-8 pb-2">Distance</th>
                                            <th className="px-8 pb-2">Status</th>
                                            <th className="px-8 pb-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {currentData.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-8 py-2">{item.date}</td>
                                                <td className="px-8 py-2 text-blue-600">{item.name}</td>
                                                <td className="px-8 py-2">{item.distance}</td>
                                                <td className="px-8 py-2">
                                                    <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                        {item.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex space-x-2">
                                                        <Button size="sm" className="bg-green-500 hover:bg-green-600 rounded-lg">
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" className="bg-red-500 hover:bg-red-600 rounded-lg">
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {!accepted && (
                                <div className="flex flex-col sm:flex-row justify-between items-center mt-3 space-y-3 sm:space-y-0 overflow-x-auto lg:overflow-visible">
                                    <span className="text-sm text-gray-500 text-center sm:text-left">
                                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, dummyData.length)} of {dummyData.length} entries
                                    </span>
                                    <div className="flex space-x-2 overflow-x-auto">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </Button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <Button
                                                key={page}
                                                variant="outline"
                                                size="sm"
                                                className={currentPage === page ? 'bg-blue-50' : ''}
                                                onClick={() => setCurrentPage(page)}
                                            >
                                                {page}
                                            </Button>
                                        ))}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <OTPVerificationModal
                isOpen={isOtpModalOpen}
                onClose={() => setIsOtpModalOpen(false)}
                title={verificationPurpose === 'start' ? 'Verify Start Service' : 'Verify Service Completion'}
                onVerify={handleVerifyOTP}
            />
        </div >
    )
}
export default Page