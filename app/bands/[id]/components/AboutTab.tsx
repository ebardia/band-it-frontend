import Link from 'next/link';

interface AboutTabProps {
  band: any;
  bandId: string;
}

export default function AboutTab({ band, bandId }: AboutTabProps) {
  return (
    <div className="space-y-6">
      {/* Tagline */}
      {band.tagline && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-2xl font-semibold text-rust italic">"{band.tagline}"</p>
        </div>
      )}

      {/* Full Description */}
      {band.fullDescription && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-earth-900 mb-4">About Us</h2>
          <p className="text-earth-700 whitespace-pre-wrap">{band.fullDescription}</p>
        </div>
      )}

      {/* Core Values */}
      {band.coreValues && Array.isArray(band.coreValues) && band.coreValues.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-earth-900 mb-4">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {band.coreValues.map((value: any, index: number) => (
              <div key={index} className="border border-earth-200 rounded-lg p-4">
                <h3 className="font-semibold text-rust mb-2">{value.name}</h3>
                <p className="text-earth-700 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decision Guidelines */}
      {band.decisionGuidelines && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-earth-900 mb-4">How We Make Decisions</h2>
          <p className="text-earth-700 whitespace-pre-wrap">{band.decisionGuidelines}</p>
        </div>
      )}

      {/* Inclusion Statement */}
      {band.inclusionStatement && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-earth-900 mb-4">Our Commitment to Inclusion</h2>
          <p className="text-earth-700 whitespace-pre-wrap">{band.inclusionStatement}</p>
        </div>
      )}

      {/* Membership Policy */}
      {band.membershipPolicy && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-earth-900 mb-4">How to Join</h2>
          <p className="text-earth-700 whitespace-pre-wrap">{band.membershipPolicy}</p>
        </div>
      )}

      {/* Empty state */}
      {!band.tagline && !band.fullDescription && !band.coreValues && !band.decisionGuidelines && !band.inclusionStatement && !band.membershipPolicy && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <h3 className="text-lg font-medium text-earth-900 mb-2">No profile information yet</h3>
          <p className="text-earth-700 mb-6">Complete your band profile to help people learn about your mission and values</p>
          <Link
            href={`/bands/${bandId}/settings`}
            className="inline-block px-6 py-3 bg-rust text-white rounded-lg hover:bg-rust-dark"
          >
            Edit Profile
          </Link>
        </div>
      )}
    </div>
  );
}